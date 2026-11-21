# 4단계 · 모의고사 및 직렬별 구성

## 변경 파일
`learning.html`, `learning.js`, `learning.css`, `mock-engine.js`, `bank-loader.js`, `exam-subjects.html`, `exam-subjects.js`, `data/exam-profiles.json`, `data/wireless-supplement.json`, 통신/무선 `index.html`, `scripts/quiz-mock-tests.cjs`, `scripts/quiz-validate.cjs`, `scripts/quiz-tests.cjs`.

## 구현
과목·문항 수·제한시간 선택, 검증된 문항만 무작위 중복 없는 출제. 출제 전 문제/선택지/해설 수식 검사. 제출 전 정답 비공개. 절대 시각 타이머 및 새로고침 복구, 시간 초과 자동 제출, 미응답 오답 처리, 상태 변경/수식 실패는 채점 보류. 단원별 정답률·오답 해설·출처·오류 신고. 고유 시험/문항 이벤트 ID로 중복 저장 방지. 전체 과목 JSON 이전 및 실제 기록 통합 대시보드.

목표 기관과 기존 합격선(연도·확인일·등급)을 개인 모의고사와 병렬 표시. 과목 범위·가산점 등이 달라 합격 여부 추정은 하지 않음. 현재 국가직 전송기술 9급/7급 수치만 기존 자료에서 재사용. 없는 합격선을 생성하지 않음.

과목표는 사용자 제공 공고의 기존 정리를 사용. 서울교통공사 일반전형 NCS 40 + 통신일반 직무 40 / 총 90분. 다른 4개 직렬의 확정 공고 과목·문항 수·시간은 ‘공고 확인 필요’. 관련 은행과 NCS 등 미제공 범위를 구분.

## 검증
`node scripts/quiz-tests.cjs`: 17개 통과. 검증 전용/부족 풀 거부, 중복 없는 선택, 벽시계 타이머, 미응답 오답·후속 review 보류·단원별 총합 검사 포함. `node scripts/quiz-validate.cjs` JS 블록 45개, JSON 25개 파싱 통과(모듈·importmap은 별도 모듈 검사 필요). 브라우저 모의고사 검증 0건 출제 차단·목표 기관 비교·과목표 확인, 앱 콘솔 오류 0건.

## 다음 단계 영향
승인 목록은 여전히 비어 있음. 실제 데이터에 임의 verified를 부여하지 않았으므로 진행 중 시험 UI의 전체 실제 문제 시나리오는 승인 이후 확인 가능. 출제·타이머·채점 핵심 동작은 합성 테스트 데이터로 검사. 5단계에서 기존 통신/무선 HTML도 같은 JSON 로더를 사용해 데이터 중복을 제거할 것.
