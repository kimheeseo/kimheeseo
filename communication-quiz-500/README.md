# 통신공학 500문항 퀴즈

첨부된 통신공학 요약노트의 학습 항목을 바탕으로 구성한 **3지선다형 HTML 퀴즈 앱**입니다.

## 퀴즈 바로 접속

**[▶ 통신공학 500문항 퀴즈 실행](https://kimheeseo.github.io/kimheeseo/communication-quiz-500/)**

위 주소는 GitHub Pages 배포가 활성화되어 있어야 열립니다. 열리지 않으면 저장소의 **Settings → Pages**에서 `Deploy from a branch → main → /(root)`로 설정하세요.

## GitHub Pages 404 오류 해결

**GitHub에 파일을 올리는 것만으로 Pages 사이트가 자동 공개되지는 않습니다.** 404 `There isn't a GitHub Pages site here`가 표시된다면 [저장소 Pages 설정](https://github.com/kimheeseo/kimheeseo/settings/pages)에서 다음 항목을 저장하세요.

1. **Source:** `Deploy from a branch`
2. **Branch:** `main`
3. **Folder:** `/(root)`
4. **Save** 클릭

GitHub Pages가 게시된 후 [퀴즈 웹 실행](https://kimheeseo.github.io/kimheeseo/communication-quiz-500/)을 다시 열어 주세요. 배포 완료 전에는 404가 유지될 수 있습니다.

## 실행
- **웹 실행:** 위의 [퀴즈 바로 접속](https://kimheeseo.github.io/kimheeseo/communication-quiz-500/) 링크를 통해 `index.html`을 실행하세요.
- **오프라인 실행:** [index.html](./index.html)을 내려받아 브라우저에서 열면 됩니다. HTML 파일 자체에 문제 500개가 포함되어 있습니다.
- **스마트폰 저장:** 앱 내 **스마트폰 HTML 다운로드** 버튼을 누르면 HTML을 저장할 수 있습니다. 이 기능은 APK 설치가 아닌 HTML 다운로드입니다.

## 주요 기능
- 총 500문항, 보기 3개 중 하나를 선택
- 단원별 / 무작위 출제
- 답안 선택 시 즉시 채점 및 해설 제공
- 오답 복습 / 즐겨찾기 / 다크모드
- **풀이 횟수, 정답률, 오답 목록, 최근 학습 이력 자동 저장** (새로고침·재접속해도 유지)
- 즐겨찾기와 테마 설정도 브라우저 내에 유지
- **오답만 다시 풀기** 버튼으로 이전 접속에서 틀린 문제 복습 가능
- 학습 기록 초기화는 **기록 초기화** 버튼을 직접 눌렀을 때만 실행

## 파일
| 파일 | 내용 |
| --- | --- |
| [index.html](./index.html) | 모바일·PC 퀴즈 앱 (문제은행 내장) |
| [quiz_bank_500.csv](./quiz_bank_500.csv) | 500문항 CSV (엑셀 편집용) |
| [quiz_bank_500.json](./quiz_bank_500.json) | 500문항 JSON (기계 가독 포맷) |

각 문제에 PDF 페이지가 표시되지만, **원본 PDF는 이 공개 저장소에 포함하지 않았습니다.** 저작권 및 공유 권한을 확인하기 전에는 원문을 공개 업로드하지 마세요.

문제와 해설은 학습용으로 재구성한 것으로, 원본 PDF와의 전 문항 교차 검증을 완료했다는 의미는 아닙니다. 중요한 수식과 오답 판단은 원문과 재확인하는 것을 권장합니다.

## 데이터 구조
각 JSON 문제는 `id`, `chapter`, `topic`, `page`, `kind`, `question`, `options`(3개), `answer`(0~2), `explanation`을 포함합니다.

## 기록 보관 유의사항

학습 기록은 접속한 브라우저의 로컬 저장소에 보관됩니다. 같은 기기의 같은 브라우저에서 다시 접속하면 기록이 유지됩니다. 다른 스마트폰/PC 또는 다른 브라우저로 자동 동기화되지는 않으며 브라우저 데이터 삭제·시크릿 모드에서는 기록이 사라질 수 있습니다. 중요한 기록은 앱의 **기록 백업** 기능을 이용하세요.
