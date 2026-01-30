-- 방명록 테이블 생성
CREATE TABLE IF NOT EXISTS guestbook (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있으면)
DROP POLICY IF EXISTS "Anyone can read guestbook" ON guestbook;
DROP POLICY IF EXISTS "Anyone can write guestbook" ON guestbook;

-- 모든 사용자가 방명록 읽기 가능
CREATE POLICY "Anyone can read guestbook"
  ON guestbook FOR SELECT
  USING (true);

-- 모든 사용자가 방명록 작성 가능
CREATE POLICY "Anyone can write guestbook"
  ON guestbook FOR INSERT
  WITH CHECK (true);

-- 비밀번호 일치하는 경우만 삭제 가능 (암호화된 비밀번호 비교)
-- Note: 실제로는 application level에서 비밀번호 체크 후 삭제해야 함
CREATE POLICY "Delete own guestbook with password"
  ON guestbook FOR DELETE
  USING (true);  -- 애플리케이션에서 비밀번호 확인 후 삭제
