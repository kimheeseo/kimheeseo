"""Normalize legacy bank metadata without changing question content or IDs."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]/'quiz500'
def walk(x):
 if isinstance(x,dict):
  if 'question' in x and ('options' in x or 'answer' in x):
   text='\n'.join(str(x.get(k,'')) for k in ['question','explanation','sourceQuality'])
   options=x.get('options',[]); a=x.get('answer')
   bad=(not isinstance(options,list) or len(options)<2 or not isinstance(a,int) or a<0 or a>=len(options) or not str(x.get('question','')).strip() or bool(re.search('[\ue000-\uf8ff]|수식.{0,8}(깨짐|누락)|그림.{0,8}(누락|미포함)|원문.{0,8}확인 필요',text)) or x.get('glyphReview') or x.get('status')=='review')
   x['status']='review' if bad else 'auto'
  for v in list(x.values()):walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
for p in ROOT.rglob('*.json'):
 d=json.loads(p.read_text());old=json.dumps(d,ensure_ascii=False);walk(d)
 if json.dumps(d,ensure_ascii=False)!=old:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
# Inline legacy banks and auxiliary JS are still loaded by the original pages.
for p in [*ROOT.rglob('*.html'),*ROOT.rglob('wireless-exam-*.js')]:
 s=p.read_text();changes=[]
 for m in re.finditer(r'\[\s*\{\s*"id"\s*:',s):
  try:d,n=json.JSONDecoder().raw_decode(s[m.start():])
  except ValueError:continue
  if not isinstance(d,list) or not any(isinstance(q,dict) and 'question' in q for q in d):continue
  walk(d);changes.append((m.start(),m.start()+n,json.dumps(d,ensure_ascii=False,separators=(',',':'))))
 for a,b,d in reversed(changes):s=s[:a]+d+s[b:]
 if changes:p.write_text(s)
