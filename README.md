# 스몰 웨딩 청첩장

기웅 & 겨울의 결혼식 초대장 (2026.03.28)

## 주요 기능

- 개인화된 초대 메시지 (URL 파라미터: `?guest=이름`)
- RSVP (참석 여부 전달)
- 방명록
- 폴라로이드 스타일 사진 갤러리 (하객 사진 업로드)
- Q&A (하객 질문 & 신랑신부 답변)
- 계좌번호 안내
- D-Day 카운터
- 오시는 길 안내

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Storage, Realtime)
- **Deployment**: Vercel

## 로컬 개발

1. 환경변수 설정
```bash
cp .env.example .env.local
```

2. Supabase 프로젝트에서 환경변수 값 복사
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. 패키지 설치 및 실행
```bash
npm install
npm run dev
```

4. http://localhost:3000 접속

## 배포

Vercel에 자동 배포됩니다.

환경변수는 Vercel Dashboard에서 설정하세요:
- Settings → Environment Variables

## Supabase 마이그레이션

```bash
# Supabase SQL Editor에서 다음 파일들을 순서대로 실행
1. supabase/migrations/001_create_rsvps_table.sql
2. supabase/migrations/002_create_photos_table_and_storage.sql
3. supabase/migrations/003_create_guestbook_table.sql
4. supabase/migrations/004_add_child_count_to_rsvps.sql
5. supabase/migrations/005_create_qna_table.sql
6. supabase/migrations/006_insert_sample_qna.sql (초기 Q&A 데이터)
```

## 개인화 링크 사용법

```
https://yoursite.com?guest=홍길동
→ "홍길동님을 초대합니다"

https://yoursite.com?guest=김철수
→ "김철수님을 초대합니다"
```

## 라이선스

Private - 개인 프로젝트
