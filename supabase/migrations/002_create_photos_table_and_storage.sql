-- Photos 테이블 생성
CREATE TABLE IF NOT EXISTS photos (
  id BIGSERIAL PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있으면)
DROP POLICY IF EXISTS "Anyone can read photos" ON photos;
DROP POLICY IF EXISTS "Anyone can upload photos" ON photos;

-- 모든 사용자가 사진 읽기 가능
CREATE POLICY "Anyone can read photos"
  ON photos FOR SELECT
  USING (true);

-- 모든 사용자가 사진 업로드 가능
CREATE POLICY "Anyone can upload photos"
  ON photos FOR INSERT
  WITH CHECK (true);

-- Storage Bucket 생성 (Supabase Dashboard에서 수동으로 생성 필요)
-- 1. Supabase Dashboard → Storage로 이동
-- 2. "New Bucket" 클릭
-- 3. Name: "photos"
-- 4. Public: true (체크)
-- 5. File size limit: 10MB
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp, image/heic

-- 또는 아래 SQL로 생성 (Dashboard 없이)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy 설정 (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "Public Access for Photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload photos to bucket" ON storage.objects;

CREATE POLICY "Public Access for Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload photos to bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');
