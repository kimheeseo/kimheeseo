-- Cloudflare D1: 같은 브라우저 / 같은 버전의 문항은 최초 채점 결과 1건만 집계
CREATE TABLE IF NOT EXISTS first_responses (
  subject TEXT NOT NULL CHECK(subject IN ('comm','wireless')),
  question_key TEXT NOT NULL,
  visitor TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK(correct IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(subject,question_key,visitor)
);

CREATE TABLE IF NOT EXISTS question_totals (
  subject TEXT NOT NULL CHECK(subject IN ('comm','wireless')),
  question_key TEXT NOT NULL,
  responses INTEGER NOT NULL DEFAULT 0 CHECK(responses >= 0),
  correct INTEGER NOT NULL DEFAULT 0 CHECK(correct >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(subject,question_key)
);

CREATE TRIGGER IF NOT EXISTS first_responses_insert
AFTER INSERT ON first_responses
BEGIN
  INSERT INTO question_totals (subject,question_key,responses,correct)
  VALUES (NEW.subject,NEW.question_key,1,NEW.correct)
  ON CONFLICT(subject,question_key)
  DO UPDATE SET responses=responses+1,correct=correct+excluded.correct,updated_at=CURRENT_TIMESTAMP;
END;

CREATE INDEX IF NOT EXISTS idx_totals_subject ON question_totals(subject);
