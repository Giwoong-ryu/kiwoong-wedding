-- Q&A 테이블 생성
CREATE TABLE IF NOT EXISTS public.qna (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    asker_name VARCHAR(100) NOT NULL,
    groom_answer TEXT,
    bride_answer TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.qna ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 승인된 Q&A를 볼 수 있음
CREATE POLICY "Anyone can view approved Q&A"
    ON public.qna FOR SELECT
    USING (is_approved = true);

-- 모든 사용자가 질문을 작성할 수 있음
CREATE POLICY "Anyone can insert questions"
    ON public.qna FOR INSERT
    WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX idx_qna_approved ON public.qna(is_approved);
CREATE INDEX idx_qna_created_at ON public.qna(created_at);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.qna;
