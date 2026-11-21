# 통신직 준비 — 정적 데이터 스키마 (2026-11-21)

## 목적
문항·기관 자료는 GitHub Pages에서 직접 읽는 **정적 JSON**으로 관리한다. 각 파일의 문항 ID는 브라우저 학습 기록과 연결되므로 변경하지 않는다.

## 문항 JSON
- `communication-quiz-500/quiz_bank_1000.json`: 배열, 통신공학 기본 1,762건.
- `wireless-quiz-500/wireless_bank_1000.json`: 배열, 무선공학 기본 1,074건. 무선설비기사 및 기타 추가 문항은 기존 `wireless-exam-*.js` 등 보충 스크립트의 공개 자료를 순서대로 병합하므로 병합 시 중복 ID를 검사해야 한다.
- `kwater-exams/generated-mocks-2-4.json`: `{metadata, rounds:[{round,durationMinutes,questions:[]}]}` 구조, 2·3·4회차 각 40문항(총 120).
- `kwater-exams/source-index-2026s.json`: `{meta,questions:[]}` 구조, 저작권 문제로 원본 40문항의 지문 대신 출처·주제·단원과 검토 상태만 보유.

### 문항 필드
| 키 | 타입 | 요구 사항 |
|---|---|---|
| `id` | string | 데이터 전역에서 일정한 고유 ID. **변경 금지** |
| `question` | string | 문제 본문. KaTeX는 `\\(...\\)`, `\\[...\\]` 등 구분자 사용 |
| `options` | string[] | 2개 이상 선택지 |
| `answer` | integer 또는 null | 0부터 시작하는 정답 인덱스. 미확정은 null |
| `explanation` | string | 학습 해설 |
| `chapter` | string | 대단원 |
| `topic` | string | 세부 단원 |
| `difficulty` | string | 하/중/상 |
| `kind` | string | 출제 유형. `?kind`와 연동하므로 이름 변경 주의 |
| `status` | string | `auto` 또는 `review`; **검증 승인은 별도의 `status-overrides.json`에서만** |
| `source` | object | `{name:string,url:string|null,checkedDate:YYYY-MM-DD,type}` |
| `legacySource` | string? | 구버전 source PDF 경로 문자열 보존 |
| `page`, `sourcePage` | number? | 원본 페이지 정보가 있는 경우 |
| `sourceLabel` | string? | 기존 기출·출처 구분, 병행 호환 |

`source.type` 허용값: `공식 공개` / `자체 창작` / `외부 참고`. `checkedDate`는 문항 정답의 검증 완료일이 아니라 메타데이터 확인일이다.

### 검증 승인
`quiz500/status-overrides.json`의 `overrides`에서 `"comm:Q001":"verified"`, `"wireless:W001":"verified"`, `"kwater:KW-ORIG-2-01":"verified"` 같은 형태만 사용한다. `review` 문항은 데이터 결함을 해결하기 전 임의 승인 금지.

## 기관·시험 자료
- `exam-subjects/catalog.json`의 `agencies[]`: `{id,name,track,examSubjects,questionCount,durationMinutes,coverage,source,reliability,cutoff}`.
- 출처에서 확인되지 않은 과목·문항수·시간·합격선은 **null**, 화면에 `공고 확인 필요`로 표시.
- `civil-service-exams/cutoff.html`의 78개 행은 `checkedDate`, `reliability`, `historyReliability` 메타 포함(향후 5단계 연계 JSON 분리 대상).
- 자료 목록은 `materials-provenance.json` 참고.

## 호환 규칙
1. `?kind=`, `?chapter=`, `?unit=`, `?year=`, `?level=` 등 기존 파라미터와 도메인·디렉터리 경로 보존.
2. 문항 ID 변경 시 이전 학습 기록이 끊기므로 동등한 새 문항도 기존 ID를 조용히 덮어쓰지 않는다.
3. 기존 `legacySource` PDF 링크는 `QuizQuality`가 활용한다. 임의 제거 금지.
4. 정적 JSON은 GitHub Pages에서 `fetch`하는 원본 데이터이다. `file://` 로컬 실행에서 fetch가 차단되면 해당 폴더의 `offline-bank.js` 미러 스크립트를 불러오도록 하여 기존 오프라인 학습을 보존한다. JSON 수정 시 `offline-bank.js`를 동기 재생성하고 `validation/check.mjs` 동기 검사를 통과해야 한다.
5. 데이터 변경마다 `quiz500/CHANGELOG.md`에 날짜·변경 건수·승인 근거·검증 결과 기록. 자동 갱신 명령은 CI가 없으므로 커밋 관리 절차에 포함한다.

## 검증
`validation/stage1-checklist.md`부터 `stage5-checklist.md`까지 참조. Chrome·Android의 실제 네트워크 및 콘솔 오류 0건은 정적 코드 검사와 별도 실측 필요.
