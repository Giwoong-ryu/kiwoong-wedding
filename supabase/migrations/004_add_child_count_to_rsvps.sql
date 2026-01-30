-- RSVP 테이블에 소인(어린이) 인원 컬럼 추가
ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0;

-- 기본값 설정 (기존 데이터의 child_count를 0으로 설정)
UPDATE rsvps
SET child_count = 0
WHERE child_count IS NULL;
