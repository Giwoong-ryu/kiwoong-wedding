-- RSVP 테이블 생성
CREATE TABLE IF NOT EXISTS rsvps (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  attending TEXT NOT NULL CHECK (attending IN ('yes', 'no')),
  guest_count INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_attending ON rsvps(attending);

-- Row Level Security (RLS) 활성화
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (공개)
CREATE POLICY "Anyone can read RSVPs"
  ON rsvps FOR SELECT
  USING (true);

-- 모든 사용자가 RSVP 제출 가능 (익명 허용)
CREATE POLICY "Anyone can insert RSVPs"
  ON rsvps FOR INSERT
  WITH CHECK (true);

-- 본인이 제출한 RSVP만 수정 가능 (현재는 미구현, 추후 auth 추가 시 사용)
-- CREATE POLICY "Users can update own RSVPs"
--   ON rsvps FOR UPDATE
--   USING (auth.uid() = user_id);
