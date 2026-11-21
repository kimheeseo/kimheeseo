# 3단계 학습 기록·복습 검증 체크리스트
작성: 2026-11-21

## 추가한 모듈
- `study-storage.js`: 문제 ID별 attempts/correct/wrong/pending, lastAt, lastDurationMs, totalDurationMs, bookmark, memo, spaced-repetition stage/nextDueAt; events; sessions; 백업/복원(JSON).
- `study-ui.js`: 통신공학·무선공학 내 오늘 복습 카드와 내 학습 현황 화면, 내보내기/가져오기, 풀이 메모.
- K-water 전용 화면에서도 같은 저장 계층 사용. 신규 문항은 제출 시 개별 풀이 시간을 기록하며 기존 시도 기록은 기존 K-water 저장소에 남겨 유지.

## 마이그레이션 주의
- 통신공학: `comms500_prefs_v2` 및 `comms500_stats_v1`, 무선공학: `wireless500_prefs_v2` / `wireless500_stats_v1`, K-water `kwater_study_v1` 내용은 삭제하지 않음.
- 기존 자료는 per-question aggregates만 있을 수 있음. 이전 풀이 시간은 **null**로 둠. 최근 7일 데이터는 마이그레이션된 집계에서 임의 추정하지 않고 새 `events`로만 계산.
- 새로운 키: `quiz500_study_v1_comm`, `quiz500_study_v1_wireless`, `quiz500_study_v1_kwater`.
- 장래 로그인 구현 시 localStorage를 교체할 수 있도록 StudyStore만 중앙 저장소 접근 경로로 구성. 기존 레거시 UI 작성은 호환 어댑터를 사용함.

## 수동 UI 테스트
1. 통신공학·무선공학 홈에 "오늘 복습할 문제 N개"가 보이고, 상단 "내 학습 현황"으로 이동하는지 확인.
2. 검증 완료 0건 상태에서 '검증된 문항만 풀기' 체크 해제 후 미검증 문제 1개 풀이. 메모·북마크 저장 후 새로고침해 유지되는지 확인.
3. 일부러 틀린 문항을 풀이하면 다음 복습 예정일이 1일 후로 기록되는지 확인. 맞히면 3일, 7일, 14일로 단계가 올라가고 다시 틀리면 1일로 돌아가는지 확인.
4. 학습 현황의 단원별 실제 정답률, 7일 풀이량, 오답 상위 3개 단원을 이전 기록과 대조.
5. JSON 백업 다운로드→새 브라우저에서 가져오기→과목/문항 기록 확인. 다른 과목 백업 파일은 거부되어야 함. 사용자 확인 없이는 덮어쓰지 않음.
6. K-water 모의고사에서 진단용 학습 모드(검증만 체크 OFF)로 1회차 풀이한 뒤 제시된 새 "내 학습 현황"에서 기록 확인. 수자원공사 원본 40문항(검토용)은 채점 불가.
7. 통신공학 기존 `?kind=...&chapter=...&unit=...`, 무선공학 기존 `?kind=...&unit=...`, K-water `?round=3`, `?mode=chapter` 작동 확인.
8. 모바일 360px, 키보드 Tab/Enter, 밝은/어두운 테마, 브라우저 F12 Console 오류 기록 여부 확인.
9. 정적 코드/단위 테스트는 통과했으나 Chrome 실제 Console 0건은 미실측.
