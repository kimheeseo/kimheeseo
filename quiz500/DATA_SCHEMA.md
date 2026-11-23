# 통신직 준비 정적 데이터 스키마 (2026-11-21)

런타임 빌드·서버 없이 동일 출처 JSON을 fetch한다. 새 데이터 변경은 CHANGELOG.md에 근거·범위·확인일을 기록한다. 실제 원문 승인 전 verified를 자동 부여하지 않는다. null은 미확인 값이며 0으로 대체하지 않는다.

## 문항

통신: `communication-quiz-500/quiz_bank_1000.json` (원본 1,762개, 기존 로더가 내용 없는 14개 보류)
무선: `wireless-quiz-500/wireless_bank_1000.json` (1,074개) + `data/wireless-supplement.json` (1,082개)
K-water: `kwater-exams/generated-mocks-2-4.json`의 `rounds[].questions` (120개)
코레일 창작 응용 2회: `korail-2026/generated-mock-2.json.questions` 30개를 `subject`(comm 20 / wireless 10)별로 공용 로더가 한 번씩 추가한다. `setId`는 세트 식별자, `number`는 세트 내 순서, `reference`는 기존 복원문항 ID/번호/PDF 쪽수(유형 참고용)이다. 창작 문항 자체의 원문 PDF 쪽수로 표시하지 않는다. 정답은 0부터 시작하며 신규 ID는 `KORAIL-2026H1-P2-01`~`30`이다.

레거시 JSON과 무선 보충 JS 파일은 과거 URL 호환용으로 보존하며 신규 학습 앱은 위 공용 로더를 사용한다.

| 필드 | 형식 / 규칙 |
|---|---|
| id | 과목 내 문항 ID 문자열. 저장 기록과 연결되므로 임의 변경 금지 |
| chapter, topic | 단원 / 세부 주제 문자열 |
| question | 지문 문자열. 수식 구분자는 `\(...\)`, `\[...\]`, `$...$`, `$$...$$` |
| options | 선택지 문자열 배열(2개 이상). 서술형은 별도 자료 스키마 |
| answer | 0부터 시작하는 정답 번호, 미확인은 null |
| explanation | 해설 문자열 |
| status | auto / review. 데이터에 verified가 있어도 승인 목록 없이는 무시 |
| source | `{name, url, checkedDate, type}`. URL 미확인은 null, 확인일 YYYY-MM-DD, 유형 공식 공개/자체 창작/외부 참고 |
| legacySource | 기존 원문 PDF 상대경로. source 객체로 이동하며 소실 금지 |
| difficulty | 하 / 중 / 상 등 기존 분류(공인 난이도 아님) |
| legacyId | 과거 중복 ID를 런타임에서 구분한 경우 이전 ID |

`status-overrides.json`: `{schemaVersion:1, overrides:{"comm:Q001":"verified"}}` 형식. 과목은 comm/wireless/kwater. 원문·정답·해설 대조 완료 후 사용자가 지정한다. review 원인을 고치기 전에는 승인으로 덮어쓸 수 없다. KaTeX 파싱 실패는 런타임 review로 강제한다. 승인 목록은 현재 비어 있다.

서술형 6문항은 `data/pages/information-communication__index.json`의 `data.DB.questions[]`로 보존한다. `status=review`, source, 모범답안 REFERENCES가 있으며 자동 채점하지 않는다.

## 자료와 통계

- `data/pages/*.json`: `{schemaVersion:1,page,data:{변수명:기존 JSON 데이터}}`. 합격선 DATA, 위치/시설 정보, 주관식 DB/REFERENCES, 단원 구성 등이 해당된다. 해당 페이지가 `page-data.js`로 읽는다.
- `data/materials/*.json`: `{schemaVersion:1,page,source,reliability,html}`. 기존 자료의 문단·표·링크·학습용 도해 서식을 보존한 저장소 관리 HTML 조각. 실행 스크립트를 포함하지 않는다. `material-content.js`가 표시한 뒤 페이지 코드가 실행된다. 사용자 기록 JSON은 이 경로에 삽입하지 않는다.
- `materials-provenance.json.items[]`: 페이지별 source, reliability, notes.
- `statistics-provenance.json.items[]`: 정적 통계 표의 id/page/text/checkedDate/reliability/source. HTML 조각의 각 행에도 data-checked-date, data-reliability를 보존한다. 동적 국가직 합격선은 원래 DATA 행의 필수 필드를 사용한다.
- 모든 확인일은 메타 점검일이다. 출처 URL을 재방문하여 내용을 재검증한 날로 간주하지 않는다.
- 비공식 후기·수치와 공식 통계는 혼합하지 않는다. 과년도 합격선에는 별도 historyReliability/historyCheckedDate가 있다.
- `data/exam-profiles.json.items[]`: id/name/noticeYear/subjects[]/questionCount/minutes/checkedDate/reliability/source/notes/cutoff. 확인되지 않은 과목·시간·문항수는 빈 배열/null. 과목 항목은 name/questionCount/coverage(일부/없음)/banks[]. cutoff는 value/year/label/checkedDate/reliability/source.
- `data/changes.json`: entries[{date,title,summary}], previousHomeHtml, archiveMarkdown. 홈은 entries의 3개만 표시. 변경 일지 페이지는 전체 보존.
- `data/home-materials.json`: 기존 단원 구성표를 blocks[DOM ID]로 보존. 표는 학습 안내용 과거 집계이며 실시간 문항 수는 공용 문제은행으로 계산.

## 학습 기록

저장 API는 `StudyStore` 한 곳으로 제한한다. 키는 `quiz500_study_v1_{comm|wireless|kwater}`. 기존 `comms500_prefs_v2`, `wireless500_prefs_v2`, `kwater_study_v1`도 호환 보존한다.

- document: schemaVersion=1, subject, items{id:item}, events[], sessions[], migrations[], createdAt, updatedAt.
- item: id/attempts/correct/wrong/pending/lastAt/lastDurationMs/totalDurationMs/bookmark/memo/chapter/topic/stage/nextDueAt/lastCorrect.
- counters: attempts = correct + wrong + pending. 시각은 ISO 또는 null. 과거에 수집하지 않은 풀이 시간은 null.
- event: id/subject/chapter/topic/at/durationMs/graded/correct/attemptId. graded=false는 정답률과 최근 채점 풀이량에서 제외.
- session: id/kind/subject/target/score/questionCount/correct/gradedCount/pending/minutes/expired/units/answers/ids/at. kind=mock은 모의고사.
- 복습: stage 0/1/2/3 = 1/3/7/14일. 오답이면 stage=0. 복습 정답이면 다음 단계, 14일 이후는 14일 유지.
- 과목별 백업: format=quiz500-study-backup, version=1, subject, record, legacy, exportedAt.
- 전체 백업: format=quiz500-study-all, version=1, subjects[과목별 백업 3개], exportedAt.
- 진행 시험 키 `quiz500_mock_active_v1`: 절대 deadline, ids, answers, durations, index, startedAt/openedAt/finishedAt, target. 제출 기록의 고유 attemptId는 재로드 중복을 방지한다.
- 목표 기관 키 `quiz500_target_v1`. 계정 연동은 StudyStore의 persistence boundary를 교체해 확장할 수 있다. 로그인·전송 서버는 없다.

## 외부 런타임

CDN 호출은 KaTeX 0.16.22의 CSS/JS/폰트뿐이다. 기존 Three.js/Leaflet CDN은 제거했다. 교육용 3D 자료는 저장소 자체 `native-3d.js`로 투영·회전·이동·확대하며 재질/그림자는 단순화된다. 유역 지도는 SVG 위치 개념도다. 공식 원문·지도 사이트 링크/사용자가 여는 외부 지도 iframe은 외부 자료이며 계산 라이브러리가 아니다.

## 검증

`node scripts/quiz-tests.cjs`, `node scripts/quiz-validate.cjs`, `node scripts/quiz-integrity.cjs`를 실행한다. 문항 내용·ID·단원별 URL의 회귀와 360px 화면, 앱 콘솔 오류는 브라우저에서 별도로 확인한다.


## 병행 변경 및 오프라인 호환 통합

`/mock-exam/`, `/exam-subjects/`, `/changelog/` 주소는 각각 통합 learning/exam-subjects/changelog 페이지로 연결하며 쿼리/해시를 보존한다. 혼합 과목은 출제 ID에 과목 접두사를 붙이고 실제 기록은 원래 과목·문항 ID에 저장한다. 기존 `quiz500_study_v1_mock` 세션은 한 번만 통신 저장 문서로 이전하고 원래 저장 키도 보존한다. 목표 기관의 seoulmetro ID는 metro로 대응한다.

공통 JSON 전송은 `QuizJSON.load`다. HTTP에서는 원본 JSON을 읽고, file://에서는 각 JSON 옆의 `.json.js` 생성 미러를 읽는다. `scripts/quiz-build-offline.cjs`가 생성하고 `scripts/quiz-offline-check.cjs`가 내용 일치를 검사한다. 레거시 offline-bank.js도 원본과 일치하도록 보존한다. JSON 미러를 직접 편집하지 않는다. localStorage는 `StudyStore`만 직접 접근하며 공동 통계 설정도 같은 어댑터를 거친다.

직접 file:// 실행은 이 환경 브라우저의 허용 프로토콜 제한으로 실측하지 못했다. 오프라인 미러의 62개 원본 일치와 로더 분기 코드는 검사했다. ES 모듈을 쓰는 3D 자료는 HTTP 실행을 사용한다.

문항 내용 수정이 승인되어 지문·정답·해설·단원이 바뀌면 `validation/bank-invariants.json`의 기준 해시도 변경 이유와 함께 갱신하고 CHANGELOG에 기록한다. 상태·출처 변경은 내용 해시에 영향을 주지 않는다.
