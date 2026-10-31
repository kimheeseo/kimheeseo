# Quiz500 | 통신공학 · 무선공학 퀴즈

통신공학 및 무선공학 3지선다 문제은행을 한 곳에 정리했습니다. 통신공학은 **1000문항**, 무선공학은 **1000문항**이며, 오답 복습과 브라우저 학습 기록 저장 기능을 제공합니다.

| 과목 | GitHub 코드 | 웹 실행 주소* |
| --- | --- | --- |
| 통신공학 1000 | [communication-quiz-500](./communication-quiz-500/) | [통신공학 퀴즈 실행](https://kimheeseo.github.io/kimheeseo/quiz500/communication-quiz-500/) |
| 무선공학 1000 | [wireless-quiz-500](./wireless-quiz-500/) | [무선공학 퀴즈 실행](https://kimheeseo.github.io/kimheeseo/quiz500/wireless-quiz-500/) |

**[Quiz500 선택 화면](https://kimheeseo.github.io/kimheeseo/quiz500/)**

\* 웹 실행 링크는 [GitHub Pages](https://github.com/kimheeseo/kimheeseo/settings/pages)가 `main` / `/(root)` 기준으로 게시된 경우 작동합니다.

**단원별 바로 풀기:** [통합 홈페이지](https://kimheeseo.github.io/kimheeseo/quiz500/)의 **전체 문제 구성 보기 → 해당 단원 전체 풀기** 버튼을 누르면 그 단원의 모든 문제만 출제됩니다. 통신공학 7개 단원과 무선공학 11개 시험단원에 대해 각각 제공됩니다.

## 단원·난이도별 학습

두 과목 모두 총 1,000문항이며, **단원별**, **난이도별(하·중·상)**, **단원+난이도 조합** 출제가 가능합니다. 통합 홈페이지의 전체 문제 구성표에서는 원하는 단원의 **전체·하·중·상** 버튼을 선택해 바로 학습할 수 있습니다.

난이도는 학습용 추정 분류입니다. 기본 개념 암기(하), 응용·계산(중), 복합 개념 및 심화 계산(상)을 기준으로 배정하였으며 공인된 난이도 등급은 아닙니다.

## 폴더 구조

```text
quiz500/
├── index.html                        # 과목 선택 화면
├── README.md                         # 이 안내 문서
├── communication-quiz-500/
│   ├── index.html                    # 통신공학 앱
│   ├── README.md
│   ├── quiz_bank_1000.csv
│   └── quiz_bank_1000.json
└── wireless-quiz-500/
    ├── index.html                    # 무선공학 앱
    ├── README.md
    ├── wireless_bank_1000.csv
    ├── wireless_bank_1000.json
    └── wireless_quiz_1000.html         # 앱 추가 HTML 파일
```

**참고:** 기존 저장소 루트의 두 폴더는 이 폴더로 이동되어 이전 URL은 달라집니다. 각 퀴즈의 학습 기록은 같은 기기·브라우저의 로컬 저장소에 있으므로 같은 GitHub Pages 도메인에서 접속하면 기존 데이터가 유지됩니다. 다른 브라우저나 기기로는 자동 동기화되지 않습니다.
