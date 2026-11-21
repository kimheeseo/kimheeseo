# 통신직 준비 · 단계별 구현 보고서
기준일: 2026-11-21. 정적 GitHub Pages 대상.

원본 등록 4,038개 / 풀이 목록 4,024개 / 검증 승인 0개. 원문 삭제·교체 없음. 활성 문항의 ID·지문·선택지·정답·해설은 해시 회귀 검사로 보존.

## 1단계 · 신뢰성 체계

상세 변경·테스트·다음 단계 영향: [validation/stage1-followup.md](./stage1-followup.md)

변경 파일:

- `quiz500/communication-quiz-500/additional-communication.json`
- `quiz500/communication-quiz-500/index.html`
- `quiz500/communication-quiz-500/national-7-communication.json`
- `quiz500/communication-quiz-500/quiz_bank_700.json`
- `quiz500/korail-2026/questions.json`
- `quiz500/trust.js`
- `quiz500/validation/stage1-followup.md`
- `quiz500/wireless-quiz-500/index.html`
- `quiz500/wireless-quiz-500/wireless-exam-extra-20261113-a.js`
- `quiz500/wireless-quiz-500/wireless-exam-extra-20261113-b.js`
- `quiz500/wireless-quiz-500/wireless-exam-reviewed-first4.js`
- `quiz500/wireless-quiz-500/wireless_bank_760.json`
- `quiz500/wireless-quiz-500/wireless_quiz_1000.html`
- `quiz500/wireless-quiz-500/wireless_quiz_760.html`
- `scripts/quiz-metadata.py`
- `scripts/quiz-tests.cjs`

## 2단계 · 출처·저작권 검토

상세 변경·테스트·다음 단계 영향: [validation/stage2-followup.md](./stage2-followup.md)

변경 파일:

- `quiz500/civil-service-exams/cutoff.html`
- `quiz500/civil-service-exams/index.html`
- `quiz500/communication-quiz-500/additional-communication.json`
- `quiz500/communication-quiz-500/index.html`
- `quiz500/communication-quiz-500/national-7-communication.json`
- `quiz500/communication-quiz-500/quiz_bank_700.json`
- `quiz500/interview/index.html`
- `quiz500/interview/korail-news-2024-2026.html`
- `quiz500/interview/korail.html`
- `quiz500/interview/kwater-basin-map.html`
- `quiz500/interview/kwater-energy-3d.html`
- `quiz500/interview/kwater-hydropower-3d.html`
- `quiz500/interview/kwater-news-2024-2026.html`
- `quiz500/interview/kwater.html`
- `quiz500/interview/rail-lte-r-3d.html`
- `quiz500/interview/rail-lte-r-cases.html`
- `quiz500/interview/rail-lte-r.html`
- `quiz500/interview/rail-personality-30sec.html`
- `quiz500/interview/rail-route-animation.html`
- `quiz500/interview/rail-workplaces.html`
- `quiz500/interview/seoul-metro-2025-2026-competition.html`
- `quiz500/interview/seoul-metro-2026-career-study-guide.html`
- `quiz500/interview/seoul-metro-news-2024-2026.html`
- `quiz500/interview/seoul-metro.html`
- `quiz500/korail-2026/questions.json`
- `quiz500/materials-provenance.json`
- `quiz500/materials.js`
- `quiz500/sources/index.html`
- `quiz500/statistics-provenance.json`
- `quiz500/validation/external-text-review-2026-11-21.csv`
- `quiz500/validation/stage2-followup.md`
- `quiz500/wireless-quiz-500/index.html`
- `quiz500/wireless-quiz-500/wireless-exam-extra-20261113-a.js`
- `quiz500/wireless-quiz-500/wireless-exam-extra-20261113-b.js`
- `quiz500/wireless-quiz-500/wireless-exam-reviewed-first4.js`
- `quiz500/wireless-quiz-500/wireless_bank_760.json`
- `quiz500/wireless-quiz-500/wireless_quiz_1000.html`
- `quiz500/wireless-quiz-500/wireless_quiz_760.html`
- `scripts/quiz-export-banks.cjs`
- `scripts/quiz-rights-audit.py`

## 3단계 · 기록·간격 반복

상세 변경·테스트·다음 단계 영향: [validation/stage3-checklist.md](./stage3-checklist.md)

변경 파일:

- `quiz500/communication-quiz-500/index.html`
- `quiz500/index.html`
- `quiz500/information-communication/index.html`
- `quiz500/interview/kwater.html`
- `quiz500/interview/rail-personality-30sec.html`
- `quiz500/kwater-exams/index.html`
- `quiz500/study-storage.js`
- `quiz500/study-ui.js`
- `quiz500/trust.js`
- `quiz500/validation/stage3-checklist.md`
- `quiz500/wireless-quiz-500/index.html`
- `quiz500/wireless-quiz-500/wireless_quiz_1000.html`
- `quiz500/wireless-quiz-500/wireless_quiz_760.html`
- `scripts/quiz-study-tests.cjs`
- `scripts/quiz-tests.cjs`

## 4단계 · 모의고사·직렬 구성

상세 변경·테스트·다음 단계 영향: [validation/stage4-checklist.md](./stage4-checklist.md)

변경 파일:

- `quiz500/bank-loader.js`
- `quiz500/communication-quiz-500/index.html`
- `quiz500/data/exam-profiles.json`
- `quiz500/data/wireless-supplement.json`
- `quiz500/exam-subjects.html`
- `quiz500/exam-subjects.js`
- `quiz500/learning.css`
- `quiz500/learning.html`
- `quiz500/learning.js`
- `quiz500/mock-engine.js`
- `quiz500/validation/stage4-checklist.md`
- `quiz500/wireless-quiz-500/index.html`
- `scripts/quiz-mock-tests.cjs`
- `scripts/quiz-tests.cjs`
- `scripts/quiz-validate.cjs`

## 5단계 · 홈·데이터·공유 준비

- 홈 동선과 최근 3건/전체 변경 일지 분리. 기존 화면 전환·단원별 주소 보존.
- 공유 문제 로더와 JSON 원천 단일화. 자료 문단/표/원문 링크를 JSON 조각으로 보존하고 페이지 스크립트는 로딩 후 실행.
- 전 페이지 메타데이터, OG PNG, 공용 접근성 CSS, 데이터 스키마와 GitHub Actions 검사.
- 기존 외부 3D·지도 CDN 대신 자체 Canvas 3D/SVG. 카메라·모형 선택·애니메이션은 유지하고 재질·그림자를 단순화. 유역 SVG는 정밀 지도 아님.
- 검사: `node scripts/quiz-tests.cjs` 21개, `node scripts/quiz-validate.cjs`, `node scripts/quiz-integrity.cjs`.
- 브라우저: 360px 주요 21개 경로 가로 넘침 없음·앱 콘솔 오류 0건. 단원/유형 링크, 기존 홈 해시 라우팅, K-water 임베드, 출처/통계/변경 일지, 3D 모델 전환·SVG 본부 선택 확인.
- 합성 문항 전용 미리보기에서 시험 답안 선택·새로고침 복구·50점 채점·오답 해설 확인. 실제 verified 승인 목록은 수정하지 않음.
- 다음 운영: 사용자 개별 검증 승인 이후 실제 검증 문항 모의고사 점검. 미확인 공고·합격선은 제공 자료가 생길 때만 입력. CSV 239개 지문 일치/나머지 후보는 확인 후 별도 삭제·교체 판단.

변경 파일(통합 전):

- `.github/ISSUE_TEMPLATE/question-error.md`
- `.github/workflows/quiz500.yml`
- `quiz500/CHANGELOG.md`
- `quiz500/DATA_SCHEMA.md`
- `quiz500/README.md`
- `quiz500/accessibility.css`
- `quiz500/assets/favicon.svg`
- `quiz500/assets/og-telecom.png`
- `quiz500/bank-loader.js`
- `quiz500/broadcast-telecom/index.html`
- `quiz500/changelog.html`
- `quiz500/changelog.js`
- `quiz500/civil-service-exams/cutoff.html`
- `quiz500/civil-service-exams/index.html`
- `quiz500/communication-quiz-500/index.html`
- `quiz500/communication-quiz-500/quiz_bank_1000.json`
- `quiz500/data/changes.json`
- `quiz500/data/home-materials.json`
- `quiz500/data/materials/civil-service-exams__cutoff.json`
- `quiz500/data/materials/civil-service-exams__index.json`
- `quiz500/data/materials/electrical-study.json`
- `quiz500/data/materials/information-communication__index.json`
- `quiz500/data/materials/interview__index.json`
- `quiz500/data/materials/interview__korail-news-2024-2026.json`
- `quiz500/data/materials/interview__korail.json`
- `quiz500/data/materials/interview__kwater-basin-map.json`
- `quiz500/data/materials/interview__kwater-energy-3d.json`
- `quiz500/data/materials/interview__kwater-hydropower-3d.json`
- `quiz500/data/materials/interview__kwater-news-2024-2026.json`
- `quiz500/data/materials/interview__kwater.json`
- `quiz500/data/materials/interview__rail-lte-r-cases.json`
- `quiz500/data/materials/interview__rail-lte-r.json`
- `quiz500/data/materials/interview__rail-personality-30sec.json`
- `quiz500/data/materials/interview__rail-route-animation.json`
- `quiz500/data/materials/interview__rail-workplaces.json`
- `quiz500/data/materials/interview__seoul-metro-2025-2026-competition.json`
- `quiz500/data/materials/interview__seoul-metro-2026-career-study-guide.json`
- `quiz500/data/materials/interview__seoul-metro-news-2024-2026.json`
- `quiz500/data/materials/interview__seoul-metro.json`
- `quiz500/data/materials/sources__index.json`
- `quiz500/data/pages/civil-service-exams__cutoff.json`
- `quiz500/data/pages/information-communication__index.json`
- `quiz500/data/pages/interview__kwater-basin-map.json`
- `quiz500/data/pages/interview__kwater-energy-3d.json`
- `quiz500/data/pages/interview__rail-personality-30sec.json`
- `quiz500/data/pages/interview__rail-workplaces.json`
- `quiz500/data/pages/wireless-quiz-500__index.json`
- `quiz500/data/pages/wireless-quiz-500__wireless_quiz_1000.json`
- `quiz500/data/pages/wireless-quiz-500__wireless_quiz_760.json`
- `quiz500/electrical-study.html`
- `quiz500/exam-subjects.html`
- `quiz500/exam-subjects.js`
- `quiz500/home.js`
- `quiz500/index.html`
- `quiz500/information-communication/index.html`
- `quiz500/interview/index.html`
- `quiz500/interview/korail-news-2024-2026.html`
- `quiz500/interview/korail.html`
- `quiz500/interview/kwater-basin-map.html`
- `quiz500/interview/kwater-energy-3d.html`
- `quiz500/interview/kwater-hydropower-3d.html`
- `quiz500/interview/kwater-news-2024-2026.html`
- `quiz500/interview/kwater.html`
- `quiz500/interview/rail-lte-r-3d.html`
- `quiz500/interview/rail-lte-r-cases.html`
- `quiz500/interview/rail-lte-r.html`
- `quiz500/interview/rail-personality-30sec.html`
- `quiz500/interview/rail-route-animation.html`
- `quiz500/interview/rail-workplaces.html`
- `quiz500/interview/seoul-metro-2025-2026-competition.html`
- `quiz500/interview/seoul-metro-2026-career-study-guide.html`
- `quiz500/interview/seoul-metro-news-2024-2026.html`
- `quiz500/interview/seoul-metro.html`
- `quiz500/korail-2026/index.html`
- `quiz500/kwater-exams/index.html`
- `quiz500/learning.html`
- `quiz500/learning.js`
- `quiz500/material-content.js`
- `quiz500/materials-provenance.json`
- `quiz500/materials.js`
- `quiz500/native-3d.js`
- `quiz500/page-data.js`
- `quiz500/quality.js`
- `quiz500/sources/index.html`
- `quiz500/study-storage.js`
- `quiz500/trust.js`
- `quiz500/validation/bank-invariants.json`
- `quiz500/wireless-quiz-500/index.html`
- `quiz500/wireless-quiz-500/wireless_quiz_1000.html`
- `quiz500/wireless-quiz-500/wireless_quiz_760.html`
- `scripts/quiz-export-banks.cjs`
- `scripts/quiz-integrity.cjs`
- `scripts/quiz-study-tests.cjs`
- `scripts/quiz-tests.cjs`
- `scripts/quiz-validate.cjs`

## 범위와 한계

- 확인일은 출처 메타 점검일이며 모든 수치/정답의 재검증 완료일이 아니다.
- 비공식 데이터와 원문 URL 미확인 값은 추정으로 채우지 않는다.
- 원문 지문 문자열 일치는 재게시 검토 근거이며 재배포 권한 판정은 아니다.
- 콘솔 검증은 앱 코드 출처 기준이며 브라우저 확장 자체 메시지는 제외한다.
- 원격의 단계 4·5 커밋을 병합해 기존 주소·혼합 과목·오프라인 미러를 통합했다. 원래 문항 및 병행 추가 파일은 보존했다.


## 최종 통합 검증

- 자동 동작 검사 21개: 레거시 모의고사 기록 이전/초기화와 가져오기 quota 실패 시 디스크·메모리 복구도 포함.
- 전 37개 HTML 페이지 title/description/OG/canonical, 활성 4,024개 문항 내용·ID 해시 보존. CDN 의존성은 KaTeX만 허용.
- JSON 62개 오프라인 미러 + 레거시 은행 2개 일치 검사. 생성 스크립트와 기존 smoke 진입점을 통합.
- 360px 주요 21개 경로: 가로 넘침 없음. 브라우저 확장·테스트 도구가 아닌 앱 출처 Console 오류 0건.
- 합성 문항 UI: 2문항 50점, 혼합 4문항 25점 및 원래 과목 기록 집계, 새로고침 복구, 시간 만료 자동 제출(0/4), 오답·미응답 해설 확인.
- `file://` 직접 열기는 브라우저 프로토콜 정책이 차단하여 실측하지 못함. 차단 우회는 하지 않았으며 원본/미러 일치와 HTTP 런타임을 검사함.
- 공고가 없는 과목/문항 수/시간과 합격선은 미확인 상태 유지. verified 승인 목록은 0건 유지.

통합 추가 변경 파일:

- `.github/workflows/quiz500-smoke.yml`
- `.github/workflows/quiz500.yml`
- `quiz500/CHANGELOG.md`
- `quiz500/DATA_SCHEMA.md`
- `quiz500/README.md`
- `quiz500/SCHEMA.md`
- `quiz500/assets/og-study.png`
- `quiz500/assets/og-study.svg`
- `quiz500/bank-loader.js`
- `quiz500/broadcast-telecom/index.html`
- `quiz500/broadcast-telecom/sourcepages/2014.json.js`
- `quiz500/broadcast-telecom/sourcepages/2015.json.js`
- `quiz500/broadcast-telecom/sourcepages/2016.json.js`
- `quiz500/broadcast-telecom/sourcepages/2017.json.js`
- `quiz500/broadcast-telecom/sourcepages/2018.json.js`
- `quiz500/broadcast-telecom/sourcepages/2020.json.js`
- `quiz500/broadcast-telecom/sourcepages/2022.json.js`
- `quiz500/broadcast-telecom/sourcepages/2025.json.js`
- `quiz500/changelog.html`
- `quiz500/changelog.js`
- `quiz500/changelog/index.html`
- `quiz500/civil-service-exams/cutoff-data.json`
- `quiz500/civil-service-exams/cutoff-data.json.js`
- `quiz500/civil-service-exams/cutoff.html`
- `quiz500/civil-service-exams/index.html`
- `quiz500/communication-quiz-500/additional-communication.json.js`
- `quiz500/communication-quiz-500/app.js`
- `quiz500/communication-quiz-500/index.html`
- `quiz500/communication-quiz-500/kwater-unit-map.json.js`
- `quiz500/communication-quiz-500/national-7-communication.json.js`
- `quiz500/communication-quiz-500/offline-bank.js`
- `quiz500/communication-quiz-500/quiz_bank_1000.json.js`
- `quiz500/communication-quiz-500/quiz_bank_700.json.js`
- `quiz500/crowd-stats.js`
- `quiz500/data/changes.json`
- `quiz500/data/changes.json.js`
- `quiz500/data/exam-profiles.json.js`
- `quiz500/data/home-materials.json.js`
- `quiz500/data/materials/civil-service-exams__cutoff.json.js`
- `quiz500/data/materials/civil-service-exams__index.json.js`
- `quiz500/data/materials/electrical-study.json.js`
- `quiz500/data/materials/information-communication__index.json.js`
- `quiz500/data/materials/interview__index.json.js`
- `quiz500/data/materials/interview__korail-news-2024-2026.json.js`
- `quiz500/data/materials/interview__korail.json.js`
- `quiz500/data/materials/interview__kwater-basin-map.json.js`
- `quiz500/data/materials/interview__kwater-energy-3d.json.js`
- `quiz500/data/materials/interview__kwater-hydropower-3d.json.js`
- `quiz500/data/materials/interview__kwater-news-2024-2026.json.js`
- `quiz500/data/materials/interview__kwater.json.js`
- `quiz500/data/materials/interview__rail-lte-r-cases.json.js`
- `quiz500/data/materials/interview__rail-lte-r.json.js`
- `quiz500/data/materials/interview__rail-personality-30sec.json.js`
- `quiz500/data/materials/interview__rail-route-animation.json.js`
- `quiz500/data/materials/interview__rail-workplaces.json.js`
- `quiz500/data/materials/interview__seoul-metro-2025-2026-competition.json.js`
- `quiz500/data/materials/interview__seoul-metro-2026-career-study-guide.json.js`
- `quiz500/data/materials/interview__seoul-metro-news-2024-2026.json.js`
- `quiz500/data/materials/interview__seoul-metro.json.js`
- `quiz500/data/materials/sources__index.json.js`
- `quiz500/data/offline-manifest.json`
- `quiz500/data/offline-manifest.json.js`
- `quiz500/data/pages/civil-service-exams__cutoff.json.js`
- `quiz500/data/pages/information-communication__index.json.js`
- `quiz500/data/pages/interview__kwater-basin-map.json.js`
- `quiz500/data/pages/interview__kwater-energy-3d.json.js`
- `quiz500/data/pages/interview__rail-personality-30sec.json.js`
- `quiz500/data/pages/interview__rail-workplaces.json.js`
- `quiz500/data/pages/wireless-quiz-500__index.json.js`
- `quiz500/data/pages/wireless-quiz-500__wireless_quiz_1000.json.js`
- `quiz500/data/pages/wireless-quiz-500__wireless_quiz_760.json.js`
- `quiz500/data/wireless-supplement.json.js`
- `quiz500/electrical-study.html`
- `quiz500/exam-subjects.html`
- `quiz500/exam-subjects.js`
- `quiz500/exam-subjects/catalog.json`
- `quiz500/exam-subjects/catalog.json.js`
- `quiz500/exam-subjects/index.html`
- `quiz500/home.js`
- `quiz500/index.html`
- `quiz500/information-communication/index.html`
- `quiz500/interview/index.html`
- `quiz500/interview/korail-news-2024-2026.html`
- `quiz500/interview/korail.html`
- `quiz500/interview/kwater-basin-map.html`
- `quiz500/interview/kwater-energy-3d.html`
- `quiz500/interview/kwater-hydropower-3d.html`
- `quiz500/interview/kwater-news-2024-2026.html`
- `quiz500/interview/kwater.html`
- `quiz500/interview/rail-lte-r-3d.html`
- `quiz500/interview/rail-lte-r-cases.html`
- `quiz500/interview/rail-lte-r.html`
- `quiz500/interview/rail-personality-30sec.html`
- `quiz500/interview/rail-route-animation.html`
- `quiz500/interview/rail-workplaces.html`
- `quiz500/interview/seoul-metro-2025-2026-competition.html`
- `quiz500/interview/seoul-metro-2026-career-study-guide.html`
- `quiz500/interview/seoul-metro-news-2024-2026.html`
- `quiz500/interview/seoul-metro.html`
- `quiz500/korail-2026/index.html`
- `quiz500/korail-2026/questions.json.js`
- `quiz500/kwater-exams/generated-mocks-2-4.json.js`
- `quiz500/kwater-exams/index.html`
- `quiz500/kwater-exams/kwater-unit-map.json.js`
- `quiz500/kwater-exams/source-index-2026s.json.js`
- `quiz500/learning.html`
- `quiz500/learning.js`
- `quiz500/material-content.js`
- `quiz500/materials-provenance.json.js`
- `quiz500/materials.js`
- `quiz500/mock-exam/index.html`
- `quiz500/page-data.js`
- `quiz500/quiz-json.js`
- `quiz500/sources/index.html`
- `quiz500/statistics-provenance.json.js`
- `quiz500/status-overrides.json.js`
- `quiz500/study-storage.js`
- `quiz500/trust.js`
- `quiz500/validation/bank-invariants.json.js`
- `quiz500/validation/check.mjs`
- `quiz500/validation/stage5-checklist.md`
- `quiz500/wireless-quiz-500/app.js`
- `quiz500/wireless-quiz-500/index.html`
- `quiz500/wireless-quiz-500/kwater-unit-map.json.js`
- `quiz500/wireless-quiz-500/offline-bank.js`
- `quiz500/wireless-quiz-500/wireless_bank_1000.json.js`
- `quiz500/wireless-quiz-500/wireless_bank_760.json.js`
- `quiz500/wireless-quiz-500/wireless_quiz_1000.html`
- `quiz500/wireless-quiz-500/wireless_quiz_760.html`
- `scripts/quiz-build-offline.cjs`
- `scripts/quiz-offline-check.cjs`
- `scripts/quiz-study-tests.cjs`
- `scripts/quiz-tests.cjs`


## PR 최신 main 충돌 해소

- main b9c2f80의 K-water 원본 40개 개별 신고, 헤드리스 브라우저 CI와 8분 제한을 통합했습니다.
- README·CHANGELOG·5단계 체크리스트는 두 변경의 기록을 모두 보존했습니다.
- CI 초기화 검사는 비공개 전역 함수 이름 대신 실제 DOM 준비 상태를 확인합니다.
- 사이트 라이브러리 의존성과 실제 문항 내용·ID는 바꾸지 않았습니다.


## CI 실측 확인

GitHub Actions에서 정적 게이트 전체와 Chrome 13개 경로의 360px·예외/콘솔 검사가 실제 통과했다. 첫 실행의 임시 프로필 정리 ENOTEMPTY 종료 경합은 Chrome 종료 대기 및 rm 재시도로 수정했다. 최종 CI 상태는 PR 체크에서 확인한다.
