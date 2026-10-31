# Quiz500 | 통신공학 · 무선공학 퀴즈

통신공학 및 무선공학 3지선다 문제은행을 한 곳에 정리했습니다. 통신공학은 **700문항**, 무선공학은 **500문항**이며, 오답 복습과 브라우저 학습 기록 저장 기능을 제공합니다.

| 과목 | GitHub 코드 | 웹 실행 주소* |
| --- | --- | --- |
| 통신공학 700 | [communication-quiz-500](./communication-quiz-500/) | [통신공학 퀴즈 실행](https://kimheeseo.github.io/kimheeseo/quiz500/communication-quiz-500/) |
| 무선공학 500 | [wireless-quiz-500](./wireless-quiz-500/) | [무선공학 퀴즈 실행](https://kimheeseo.github.io/kimheeseo/quiz500/wireless-quiz-500/) |

**[Quiz500 선택 화면](https://kimheeseo.github.io/kimheeseo/quiz500/)**

\* 웹 실행 링크는 [GitHub Pages](https://github.com/kimheeseo/kimheeseo/settings/pages)가 `main` / `/(root)` 기준으로 게시된 경우 작동합니다.

## 폴더 구조

```text
quiz500/
├── index.html                        # 과목 선택 화면
├── README.md                         # 이 안내 문서
├── communication-quiz-500/
│   ├── index.html                    # 통신공학 앱
│   ├── README.md
│   ├── quiz_bank_700.csv
│   └── quiz_bank_700.json
└── wireless-quiz-500/
    ├── index.html                    # 무선공학 앱
    ├── README.md
    ├── wireless_bank_500.csv
    ├── wireless_bank_500.json
    └── wireless_quiz_500.html         # 앱 추가 HTML 파일
```

**참고:** 기존 저장소 루트의 두 폴더는 이 폴더로 이동되어 이전 URL은 달라집니다. 각 퀴즈의 학습 기록은 같은 기기·브라우저의 로컬 저장소에 있으므로 같은 GitHub Pages 도메인에서 접속하면 기존 데이터가 유지됩니다. 다른 브라우저나 기기로는 자동 동기화되지 않습니다.
