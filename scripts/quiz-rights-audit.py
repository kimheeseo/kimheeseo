"""Local exact-text check; similarity is evidence of text reuse, not a legal ruling."""
import json,re,csv,sys
from pathlib import Path
from pypdf import PdfReader
banks=json.loads(Path(sys.argv[1]).read_text());root=Path(__file__).resolve().parents[1]/'quiz500';cache={}
def norm(s):return re.sub(r'\W|_','',s).lower()
rows=[]
for subject,qs in banks.items():
 for q in qs:
  source=q.get('source') or {};kind=str(q.get('kind',''));legacy=q.get('legacySource');evidence='원문 문장 대조 필요';matched=False
  if source.get('type')=='자체 창작':continue
  if not (legacy or q.get('sourceLabel') or '기출' in kind or q.get('sourceQuestion')):continue
  if legacy:
   f=root/'communication-quiz-500/source-pdfs'/legacy
   if f.is_file():
    try:
     if str(f) not in cache:cache[str(f)]=norm('\n'.join(p.extract_text() or '' for p in PdfReader(f).pages))
     text=norm(q.get('question',''));matched=len(text)>=20 and text in cache[str(f)]
     if matched:evidence='저장소 원본 PDF와 지문 정규화 문자열 완전 일치'
    except Exception:evidence='PDF 텍스트 추출 실패 · 수동 대조 필요'
  rows.append([subject+':'+q['id'],source.get('name','출처 확인 필요'),source.get('url') or legacy or '', '링크로 대체' if matched or legacy else '자체 창작 응용으로 교체','확인된 지문 일치' if matched else '후보',evidence])
p=root/'validation/external-text-review-2026-11-21.csv'
with p.open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(['문항 ID','출처','출처 URL 또는 기존 PDF','처리 제안','대조 결과','근거']);w.writerows(rows)
print('Rows',len(rows),'exact local matches',sum(x[4]=='확인된 지문 일치' for x in rows))
