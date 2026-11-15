# 통신직 문제은행 공동 난이도 집계 (Cloudflare Workers + D1)

현재 GitHub Pages는 정적 호스팅이므로 방문자 전체의 문제풀이 기록을 저장할 수 없습니다. 이 폴더의 Cloudflare Worker와 D1을 별도로 배포해야 **실제 누적 집계가 시작됩니다.** 백엔드가 없으면 문제풀이는 계속 가능하고 공동 통계에는 '연결 전'이 표시됩니다.

## 배포 (Cloudflare Free)

Cloudflare 계정에 로그인한 상태로 로컬 PC에서 Node.js 및 Wrangler CLI를 설치한 뒤 이 폴더에서 실행합니다.

```bash
npm install -g wrangler
wrangler login
wrangler d1 create telecom-crowd-stats
```

반환된 D1 database_id를 `wrangler.toml`의 `database_id`에 입력하고 다음을 실행합니다.

```bash
wrangler d1 execute telecom-crowd-stats --remote --file=schema.sql
wrangler deploy
```

배포된 `https://telecom-crowd-stats.<계정>.workers.dev` 주소를 상위 `quiz500/crowd-config.js`의 `window.TELECOM_STATS_API_URL`에 입력하고 GitHub Pages에 반영하면 연결됩니다. 브라우저에서 `/v1/health`를 열면 DB 연결 여부를 확인할 수 있습니다.

## 정책 및 지표

- 채점 완료+정답이 있는 문항만 저장합니다. 건너뛰기, 미채점, 보류 문항은 제외합니다.
- 이용자가 '익명 정답/오답 통계 참여'를 직접 선택한 뒤부터만 전송합니다.
- 이름·이메일·문항 본문·원래 답안 번호는 서버로 전송하지 않습니다. 임의 브라우저 식별용 UUID, 문제 버전 해시, 정답 여부만 저장합니다.
- 같은 브라우저의 같은 문제 버전은 최초 1회만 합산합니다(재도전·새로고침·중복 전송 제외). 서로 다른 브라우저를 한 사람으로 정확히 구분할 수는 없습니다.
- **누적 정답률 = 정답 기록 수 / 유효 최초 응답 수 × 100**. 20건 이상일 때만 임시 난이도 표시: 하(≥80%), 중(50~79%), 상(<50%). 20건 미만에는 참고 정답률만 표시합니다.
- 개인의 기존 학습 기록과 오답노트는 브라우저에 그대로 유지됩니다. 개인 초기화는 공동 통계를 삭제하지 않습니다.
- 서버 통계는 임의 초기화하지 않으며, 개인정보 삭제/관리 정책과 예외적인 DB 복구·삭제는 운영자가 별도로 관리해야 합니다.
- 로그인 없는 익명 UUID 기반이라 브라우저 초기화·악의적 자동 요청에 대한 완전한 방어는 불가능합니다. 운영 전 rate limiting/Turnstile, 이상 응답 검증을 권장합니다.
- Cloudflare Workers Free와 D1 Free는 제한이 있으므로 규모 확대 시 공식 문서로 일일 요청·읽기/쓰기·용량 제한을 확인하세요.

## API

`GET /v1/stats?subject=comm&key=xxxxxxxx-xxxxxxxx` · 문항별 집계
`GET /v1/summary?subject=wireless` · 과목별 집계
`POST /v1/attempt` · 익명 최초 응답 집계

CORS는 `https://kimheeseo.github.io`로 제한합니다.
