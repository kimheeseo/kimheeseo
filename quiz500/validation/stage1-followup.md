# 1단계 보완 결과 · 2026-11-21

- 변경 파일: `trust.js`, 통신/무선 `index.html`, `communication-quiz-500/{quiz_bank_700,national-7-communication,additional-communication}.json`, `wireless-quiz-500/wireless_bank_760.json`, 무선 보충 JS 3개·레거시 HTML 2개, `korail-2026/questions.json`, `scripts/quiz-metadata.py`, `scripts/quiz-tests.cjs`.
- 변경: 주 문제은행 외의 레거시·추가 데이터에도 auto/review 상태 적용. 승인 파일 경로를 trust.js 기준으로 해석. 무선 정답률 분모에서 채점 보류 제외. 검토 중 선택지를 오답 색상으로 표시하지 않음.
- 테스트: `node scripts/quiz-tests.cjs` 5개 통과, JSON 문항 4,955개 상태 검사. 브라우저 통신 홈에서 기본 검증 0건·필터 해제·검토 중 배지·출처·신고 폼·메모 확인. 앱 출처 콘솔 오류 0건(브라우저 확장 자체 오류 제외).
- 다음 단계 영향: 원문/정답/해설 미검증이므로 승인 목록은 비워 둠. 통신 1,762개 중 기존 로더가 빈 내용 14개를 보류해 실제 풀이 목록은 1,748개. 출처 메타는 정답 검증과 독립.
