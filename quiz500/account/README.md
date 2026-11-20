# 통신직 학습 계정 + 누적 오답률 (배포 가이드)

이 PR은 통신공학·무선공학 기존 문제은행과 로컬 학습 기록을 보존한 상태에서 **이메일 로그인, 계정별 서버 학습 기록, 단원·난이도별 취약점, 회원 전체 문항별 최초 응답 오답률**을 추가합니다.

## 구조와 동작

- 화면: `quiz500/account.js` — 포털/두 문제은행의 상단 **로그인 → 내 학습 분석** 버튼. 이메일 OTP(매직 링크), 학습 통계, 로그아웃, 서버 기록 삭제.
- 설정: `quiz500/account-config.js` — 공개 Supabase URL 및 Publishable key만 입력. **service_role / secret key 금지.**
- 데이터베이스: `quiz500/account/schema.sql` — Supabase PostgreSQL + Auth. 인증된 사용자별 기록, 중복 전송 이벤트 방지, 계정별/전체 RPC, RLS. 다른 회원의 원본 기록을 읽을 수 없음.
- 연결: 기존 `crowd-stats.js`의 채점 이벤트를 회원 계정 모듈에 전달. 익명 Cloudflare Worker 통계는 기존 방식과 별도로 보존됨.
- 로그인 후 채점한 문제만 계정 서버에 추가됩니다. 익명 시점의 기존 브라우저 기록을 자동 업로드하지 않으며, `localStorage` 기록은 기존과 같이 유지됩니다.
- 회원 전체 집계는 **동일 계정 + 동일 문제 버전에서 첫 채점 1회만** 반영합니다. 개인 집계는 오답 복습을 포함한 모든 채점 기록을 반영합니다.
- 문제 버전 키는 문항 ID와 질문·보기·정답 서명으로 구성됩니다. 정답 수정 시 기존 판본의 누적치와 혼합하지 않습니다.
- 전체 비교는 단원/난이도별 **서로 다른 회원 20명 이상**일 때만 노출합니다. 문항별 20건 미만은 표본 수만 공개합니다.
- 오프라인/일시적 실패는 계정별 브라우저 업로드 대기열에 보관하고 온라인 복귀 시 재시도합니다. 이벤트 UUID를 서버에서 중복 제거합니다.

## 운영자가 해야 할 일 (현재 실제 로그인은 연결 전)

1. [Supabase](https://supabase.com/) 프로젝트 생성. Auth → Providers에서 Email을 사용하도록 설정. 운영 시 메일 발송 설정/사용량 제한 확인.
2. Supabase **SQL Editor**에서 `account/schema.sql`을 실행. 테이블, RLS, RPC가 생성되었는지 확인.
3. Authentication → URL Configuration에서 Site URL을 `https://kimheeseo.github.io/kimheeseo/quiz500/`로 설정하고 Redirect URLs에 `https://kimheeseo.github.io/kimheeseo/quiz500/**`를 허용.
4. Project Settings/API에서 공개 Project URL과 **Publishable key** (레거시 프로젝트는 `anon` 공개 키)를 `quiz500/account-config.js`에 입력. 비밀키는 절대로 커밋하지 말 것.
5. PR 병합 후 GitHub Pages 배포. 실제 메일 링크를 통해 로그인하고 통신공학/무선공학의 정답·오답을 각각 한 번씩 제출하여 개인 대시보드 확인.
6. 두 개의 서로 다른 계정으로 같은 문항을 풀어 집계 확인. 같은 계정으로 동일 문항 재풀이 시 **회원 전체 통계는 최초 응답을 유지**, 개인 통계만 늘어나는지 확인.
7. 20명 미만의 집계 정답률 미노출, 회원 간 원본 기록 접근 차단(RLS), 로그아웃/기록 삭제, 오프라인 복구, 모바일 UI 확인.

## API (공개 PostgREST RPC 경유)

- `telecom_record_attempt(p_event_id,p_subject,p_key,p_question_id,p_chapter,p_topic,p_difficulty,p_correct)` — 인증된 계정의 채점 이벤트 1건
- `telecom_my_stats()` — 내 단원·난이도별 누적 응답 (재풀이 포함)
- `telecom_question_stats(p_subject,p_key)` — 계정별 최초 응답 기준 문항 통계 (n≥20일 때만 정답률 공개)
- `telecom_cohort_topics(p_subject)` — 20명 이상 단원별 전체 집계
- `telecom_delete_my_attempts()` — 내 원격 채점 기록 삭제 (기존 브라우저 기록/익명 Cloudflare 집계는 삭제되지 않음)

## 유의사항

- GitHub Pages는 정적 호스팅입니다. **Supabase 프로젝트/메일 설정 없이 코드만 병합하면 로그인이나 서버 집계가 실제로 작동하지 않습니다.**
- 공개된 브라우저 JavaScript 안에는 정답이 존재하므로, 로그인/RLS만으로 허위 정답 제출을 완벽히 막을 수 없습니다. 공개 서비스 운영 전 CAPTCHA, 속도 제한, 이상 응답 탐지, 이메일 인증 및 DB 백업/개인정보 처리 방침을 검토하세요.
- 테스트용 가짜 통계는 제공하지 않습니다. 실제 표본이 생기기 전에는 수치 대신 '대기'가 표시됩니다.
- Supabase 요금제와 이메일 발송의 무료 한도·상용 운영 조건은 서비스의 최신 정책을 확인해야 합니다.
- 통신공학/무선공학의 과거 브라우저 기반 개인 데이터는 별도 이관 절차를 만들기 전에는 계정 통계에 포함되지 않습니다.
