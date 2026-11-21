# 5단계 공유·홈·데이터 분리 QA 및 단계별 최종 검증
작성: 2026-11-21

## 자동 검증
- 저장소 루트에서 `node quiz500/validation/check.mjs` 실행(권장 Node 22). 별도 npm/CDN 필요 없음.
- GitHub Actions `.github/workflows/quiz500-smoke.yml`은 quiz500 파일 변경 시 정적 검사를 실행한다.
- 스크립트가 정적 검증을 통과해도 **실제 브라우저 콘솔 오류 0건을 입증하지는 못한다**.

## 모바일·브라우저 수동 테스트 (필수)
1. GitHub Pages `quiz500/`에서 새로고침한 뒤 360px, 375px, 768px, 데스크톱 너비를 각각 확인. 가로 스크롤·버튼 잘림이 없고 4개 학습 카드 순서가 올바른지 확인.
2. 루트 '최근 업데이트'에는 최신 3건만 있고, '전체 변경 일지'에서 `CHANGELOG.md` 전체가 표시되는지 확인.
3. 통신공학/무선공학 학습 홈에서 데이터 로드 중 안내가 정상적으로 사라지고 문항 수·정답률이 나타나는지 확인. 또한 PC에서 각 폴더의 `index.html`을 `file://`로 직접 열어 JSON fetch 차단 시 `offline-bank.js`가 로드되고 기본 퀴즈가 동작하는지 확인. 브라우저 Network에서 `quiz_bank_1000.json`, `wireless_bank_1000.json`, 각 `app.js`가 200 응답을 반환해야 함.
4. 기존 쿼리 파라미터 **`?kind=`, `?chapter=`, `?unit=`, `?level=`** 및 통신공학 `?view=kwater` 딥링크 검증. 폼값과 화면이 반영되어야 함.
5. K-water 전용 2/3/4회차 및 2026 원본 분류표가 유지되는지 확인. 모의고사·기출 원본의 저작권/검토 경고가 사라지지 않아야 함.
6. `civil-service-exams/cutoff.html` 통계의 외부 `cutoff-data.json` 200 응답 확인, 78개 단위 필터·그래프·CSV 테스트.
7. `mock-exam/`은 verified 승인 0개 상태에서 시작 버튼 비활성. 개별 정답/해설 검증을 마친 문항에 한해 승인 후 시간제한 풀이·성적·단원별 분석·목표 기관 참고 비교 검증.
8. `sources/`, `exam-subjects/`, `changelog/` 페이지의 공식/비공식 메타·출처 링크 및 404 여부 점검.
9. <head>의 `og:image` URL은 `https://kimheeseo.github.io/kimheeseo/quiz500/assets/og-study.png`을 가리킴. KakaoTalk·커뮤니티에 루트·문제은행 URL 공유해 PNG 썸네일 노출을 확인. 플랫폼별 OG 캐시 때문에 이전 이미지가 남을 수 있음.
10. 키보드 Tab·Shift+Tab·Enter/Space, 브라우저 다크모드·포커스 표시·360px에서 신고 메모/체크박스 조작 확인.
11. Chrome DevTools F12 → Console(Errors), Network(404/JS/CSS/JSON), 모바일 Device Toolbar를 열고 홈→단원문제→문제은행→채점→K-water→기관→모의고사 이동. **Console error 0건은 이 실제 검사를 수행한 경우에만 합격 처리할 것**.
12. 문제가 발견되면 각각 문항 ID/페이지 URL/재현 단계/Console 로그를 [GitHub Issues](https://github.com/kimheeseo/kimheeseo/issues/new)에 기록.

## 단계 간 보존 확인
- 기존 `localStorage` 저장 키와 신규 StudyStore 키가 삭제되지 않는지 확인.
- `quiz500/status-overrides.json` 외부에서 verified 승격되지 않는지 확인.
- 이전 `source` PDF 경로는 `legacySource`로 보존되고 링크가 유지되는지 확인.
- 외부 원문 전재 가능성 후보 753건을 임의 삭제/교체하지 않았는지 확인.
- 새 문항·출처·학습 구조를 변경할 때 `quiz500/CHANGELOG.md`에도 근거와 날짜를 기재.

## 제약
외부 서비스 연결 없이 정적 GitHub Pages에서 작동. 외부 런타임 의존성은 KaTeX CDN만 사용.
