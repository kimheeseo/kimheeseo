# 무선공학 500문항 퀴즈 앱

**[▶ 무선공학 500문항 웹앱 바로 접속](https://kimheeseo.github.io/kimheeseo/quiz500/wireless-quiz-500/)**

> GitHub Pages 게시가 설정되어 있어야 위 주소로 접속할 수 있습니다. 404가 나오면 아래 설정을 확인하세요.

## 구성
첨부한 **무선공학.pdf(27페이지)**를 기반으로 제작한 학습용 3지선다 퀴즈입니다. 총 500문항 중 **256문항은 무선공학 PDF와 동일하게 수록된 신호·변조·디지털 전송의 공통 기초 단원을 바탕으로 재구성**하고, **244문항은 전자파·안테나·급전선·전파전파·페이딩·무선망·이동통신·위성/레이더** 등 뒤쪽 단원에서 새로 구성했습니다.

## 주요 기능
- 총 **500문항**, 각 문항 **보기 3개 / 정답 1개**
- 단원별·무작위·순차 출제, 10·20·50·100·전체 문항 선택
- 답 선택 시 즉시 채점, 오답/정답 해설, 원본 PDF 페이지 표기
- **재접속해도 풀이 이력·정답률·오답 목록 유지** (브라우저 로컬 저장)
- **오답만 다시 풀기**, 즐겨찾기, 학습 기록, JSON 백업/복원
- 모바일·PC 브라우저 지원, 다크모드

## 파일 안내
| 파일 | 설명 |
| --- | --- |
| [index.html](./index.html) | GitHub Pages 실행용 단일 HTML 앱(500문항 내장) |
| [wireless_quiz_500.html](./wireless_quiz_500.html) | 추가 HTML 실행 파일 (index.html과 동일) |
| [wireless_bank_500.csv](./wireless_bank_500.csv) | 500문항 문제은행 CSV |
| [wireless_bank_500.json](./wireless_bank_500.json) | 500문항 문제은행 JSON |

## 404 오류가 뜨는 경우
[GitHub Pages 설정 열기](https://github.com/kimheeseo/kimheeseo/settings/pages) → **Build and deployment** → Source: `Deploy from a branch` → Branch: `main` → Folder: `/(root)` → **Save**.

사이트 주소는 `https://kimheeseo.github.io/kimheeseo/quiz500/wireless-quiz-500/`입니다. 배포가 활성화되지 않은 경우 주소는 404로 보입니다.

## 학습 기록 주의 사항
학습 기록은 **현재 기기·브라우저의 localStorage**에 저장됩니다. 웹사이트와 파일(`file://`)로 실행할 경우 브라우저 저장 공간이 서로 달라 기록이 공유되지 않을 수 있습니다. **브라우저 데이터 삭제, 시크릿 모드, 다른 기기**에서는 기록이 유지되지 않을 수 있으니 `학습 기록 → 기록 백업` 기능을 이용하세요.

원본 PDF는 저작권·공유 권한 확인 전 공개 저장소에 업로드하지 않았습니다. 원본 필기와 수식·용어를 대조해 사용하세요. 이 문제은행은 외부 검증을 완료한 공식 기출문제가 아닙니다.