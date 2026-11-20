# 통신직 학습 계정: Google 로그인 + 개인/전체 통계

기존 GitHub Pages 문제은행(통신공학·무선공학)을 그대로 유지하면서 **Google 계정 로그인**, **개인별 누적 채점**, **문항별 전체 오답률**, **단원·난이도 취약점 분석** 기능을 확장합니다.

## 현재 상태

GitHub Pages 코드와 Supabase PostgreSQL 마이그레이션은 저장소에 준비되어 있습니다. 하지만 **Supabase 실제 프로젝트 및 Google OAuth 연결 정보가 비어 있다면 로그인과 서버 기록 저장이 동작하지 않습니다.** 웹페이지에서는 연결 전이라고 안내합니다. 가상 정답률은 표시하지 않습니다.

## 권장 구성

1. **로그인:** Google OAuth 2.0 (Supabase Auth의 Google provider)
2. **학습 데이터:** Supabase PostgreSQL + 사용자별 RLS
3. **정적 웹 호스팅:** 기존 GitHub Pages 유지
4. **Google Drive 권한:** 요구하지 않음. 구글 Drive는 로그인 서비스나 사용자 공유 통계 DB 용도가 아닙니다.
5. 별도 비밀번호 등록 불필요. 계정 고유 ID는 Google 로그인 후 Supabase의 auth.users.id 사용.

## 연결 방법 (운영자)

1. [Supabase](https://supabase.com)에서 프로젝트 생성. SQL Editor에서 `quiz500/account/schema.sql` 전체 실행.
2. Supabase 대시보드 Authentication → Providers → Google을 활성화하기 위한 Google OAuth Client ID, Client Secret 준비.
3. [Google Auth Platform](https://console.cloud.google.com/auth/overview)에서 프로젝트 및 OAuth 동의 화면 설정. OAuth Client ID는 **Web application** 유형 사용.
4. Google OAuth의 Authorized JavaScript origins에 `https://kimheeseo.github.io` 추가. Authorized redirect URIs에는 **Supabase Google provider 설정 화면에 나오는 콜백 URL** (일반적으로 `https://<project-ref>.supabase.co/auth/v1/callback`)을 정확히 추가합니다. Client Secret은 반드시 Google Cloud/Supabase 설정 화면에만 입력하고 GitHub에 올리지 않습니다.
5. Supabase Authentication → URL Configuration에서 Site URL을 `https://kimheeseo.github.io/kimheeseo/quiz500/`, Redirect URLs에 동일 URL을 등록.
6. `quiz500/account-config.js`의 `url` 및 **publishable key**를 채웁니다. 공개 키만 허용하며 `service_role`, Google Client Secret, Google API Secret 등 비밀키는 절대로 커밋하지 않습니다.
7. GitHub Pages가 배포된 뒤 Google 계정 선택 → 통신공학/무선공학 문제 채점 → 상단 '내 학습 분석'의 수치를 확인합니다. 최소 2계정으로 내 기록만 읽을 수 있는지, 동일 문항 재풀이 시 공동 통계가 중복되지 않는지 확인합니다.

Supabase 공식 안내: [Google 로그인](https://supabase.com/docs/guides/auth/social-login/auth-google) · [OAuth 리디렉션 URL](https://supabase.com/docs/guides/auth/redirect-urls).

## 데이터 보존·분석 규칙

- 화면에서 **서버 채점 기록 저장에 동의한 로그인 회원**의 응답만 서버에 추가합니다.
- 로그인하지 않거나 미설정 상태에서도 기존 문제 풀기, 브라우저 기반 오답노트·진도·로컬 기록은 그대로 사용 가능합니다.
- 익명 Cloudflare 공동 통계 코드는 별도 유지합니다. 설정이 비어 있는 경우 기존과 같이 '연결 전' 표시됩니다.
- 각 기록: 회원 ID(인증 서버에서 부여), 문항 키/버전, 주제·단원·난이도, 정오답 및 풀이 시각, 이벤트 UUID. 문항 본문이나 Google Drive 문서는 서버에 업로드하지 않습니다.
- 전체 난이도: 한 로그인 계정당 동일 문항 버전의 **최초 풀이만** 집계합니다. 문항별 유효 응답 20건 미만은 정답률을 비공개합니다. 단원별/전체 평균은 서로 다른 회원 20명 이상에서만 노출합니다.
- 개인 정답률: 오답 복습 포함 모든 채점 결과. 전원 평균과 개인 평균의 분모가 다른 점을 UI에서 구분합니다.
- 같은 브라우저·계정의 네트워크 장애나 재시도로 인한 중복 기록은 이벤트 UUID로 제거합니다.
- 다른 회원의 원본 기록은 조회 불가능하게 RLS 보호. 회원은 서버 학습 기록을 삭제할 수 있으며 익명 통계나 다른 회원 기록에는 영향을 주지 않습니다.
- 과거 브라우저의 학습 기록을 로그인 계정에 자동 소급 이관하지 않습니다. 향후 별도 이관을 만들면 사용자 확인을 받아야 합니다.
- 브라우저 JS에서 정답 확인이 가능한 구조이므로 악의적 통계 조작을 100% 방지할 수 없습니다. 운영 단계에서는 속도 제한, 자동화 탐지, 관리자 모니터링이 필요합니다.

## 계정 통계 API

- `telecom_record_attempt`: 인증 계정의 채점 이벤트 기록, UUID 기준 재전송 중복 제거
- `telecom_my_stats`: 개인 단원/난이도별 정답·오답 집계
- `telecom_global_summary`: 전체 최초 응답 평균 (고유 계정 수가 20 미만이면 비공개)
- `telecom_cohort_topics`: 단원별 전체 최초 응답 비교 (고유 계정 수 20 미만이면 비공개)
- `telecom_question_stats`: 문항별 전체 실측 정답률/난이도 (표본 20 미만이면 비공개)
- `telecom_delete_my_attempts`: 내 서버 학습 기록 삭제

## 배포 전 기능 시험 목록

- [ ] Google Auth 연결 및 리디렉션 성공 / 로그아웃
- [ ] Google Drive 권한 동의 화면 없음
- [ ] 로그인 전·후 개인 학습기록과 정오답 채점 동일
- [ ] 두 학습 과목 채점 이벤트 서버 기록
- [ ] 다른 회원의 원본 데이터 비공개(RLS) 검증
- [ ] 반복 풀이: 개인 기록 누적, 전체 난이도는 최초 1회만
- [ ] 20명 미만 통계 비공개
- [ ] 오프라인 재전송 및 중복 방지
- [ ] 기록 저장 동의 해제 및 내 기록 삭제
- [ ] PC·모바일, 공무원 메뉴 등 기존 내비게이션 유지

> 유의: 실제 Supabase 프로젝트/API 키/Google OAuth Client Secret이 아직 구성되지 않았다면 연동 테스트는 미실행 상태입니다. Supabase의 무료 한도 및 Google OAuth 사용 정책은 운영 시 최신 조건을 확인하세요.
