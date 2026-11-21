# 2단계 출처·저작권 검증 체크리스트
작성일: 2026-11-21

## 변경 요약
- `quiz500/sources.js`, `quiz500/sources/index.html`, `quiz500/materials-provenance.json`
- 원천 문항 JSON 4개: 모든 2,996개 문항에 `source{name,url,checkedDate,type}` 객체 필드 추가.
- 통신공학 원본 PDF 경로 문자열 `source` 669건은 `legacySource`에도 보존.
- `quiz500/validation/external-text-candidates-2026-11-21.csv`: 753건 **재게시 가능성 후보**. 실제 문장 단위 원문 대조·권리 확인 전에는 확정 목록으로 사용 불가.
- 국가직 7·9급 통계 78개 행: `checkedDate`, `reliability`, `historyReliability` 필수 필드와 표·CSV 표시.

## 확인 방법
1. `quiz500/sources/`에서 자료 유형(공식 공개/자체 창작/외부 참고), 링크 중심 안내, 비공식 커트라인 주의, 신고 절차가 보이는지 확인.
2. 통신공학·무선공학에서 '검증된 문항만'을 끄고 문항을 열어 출처명·유형·메타 확인일을 확인. 기존 원본 PDF 경로가 존재하는 문항의 PDF 링크 확인.
3. K-water 원본 1회차 분류표에서 40개 문항의 민간 참고 출처와 확인일 표시, 2~4회차 풀이에서 '자체 창작' 출처 확인.
4. 국가직 `civil-service-exams/cutoff.html`에서 7·9급을 전환해 2026 데이터의 공식/비공식 구분 및 확인일 열, CSV 내보내기 메타데이터 확인.
5. `civil-service-exams/`의 국가직 2027 일정 공식 표시와 지방직 공고 확인 필요 표시, `interview/korail.html`의 경쟁률 비공식 표시 확인.
6. 주요 페이지 홈 하단 '자료 출처·이용 안내' 링크와 GitHub Issues 오류 제보 링크 확인.
7. 후보 CSV의 각 행은 외부 공개 원문과 **문장 단위로 수작업 비교**한 뒤에만 처리 제안(링크 대체 / 자체 창작 응용 / 유지)을 결정. 이 단계는 어떠한 문항도 삭제하지 않음.
8. F12 Console/Network 오류 확인. 정적 JavaScript 파싱 통과만으로 브라우저 Console 0건이 입증되는 것은 아님.

## 후속 영향
- 3단계 학습기록은 기존 `progress/bookmarks/history` 저장 키와 문항 ID를 보존해 출처 필드 추가로 기록을 소실하지 않아야 함.
- 4단계 기관 합격선 비교에서는 `checkedDate/reliability`를 그대로 표시할 것.
- 5단계 HTML 데이터 분리 시 `legacySource` 원문 PDF 경로와 `source` 객체를 모두 옮길 것.
