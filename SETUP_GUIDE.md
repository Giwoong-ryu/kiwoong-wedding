# 스몰 웨딩 청첩장 설치 가이드

> 비개발자도 따라할 수 있는 단계별 가이드

## 📋 준비물

1. GitHub 계정 (무료)
2. Vercel 계정 (무료)
3. Supabase 계정 (무료)
4. Node.js 18+ 설치 (https://nodejs.org)

---

## 🚀 Step 1: 프로젝트 준비

### 1-1. 코드 다운로드

```bash
# 프로젝트 폴더로 이동
cd c:\Users\user\Desktop\gpt\WDDING

# 의존성 설치
npm install
```

설치 완료까지 **3-5분** 소요됩니다.

---

## 🗄️ Step 2: Supabase 설정

### 2-1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New project" 클릭
5. 입력:
   - Project name: `wedding-invitation`
   - Database Password: 자동 생성된 비밀번호 복사 (저장 필수!)
   - Region: Northeast Asia (Seoul)
6. "Create new project" 클릭 (2-3분 대기)

### 2-2. 데이터베이스 테이블 생성

1. 왼쪽 메뉴 → "SQL Editor" 클릭
2. "+ New query" 클릭
3. 아래 SQL 복사 붙여넣기:

```sql
-- RSVP 테이블
CREATE TABLE rsvp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  attending TEXT NOT NULL CHECK (attending IN ('yes', 'no')),
  guest_count INTEGER DEFAULT 0,
  message TEXT
);

-- 하객 사진 테이블
CREATE TABLE guest_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  photo_url TEXT NOT NULL,
  uploaded_by TEXT
);

-- RLS 활성화
ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_photos ENABLE ROW LEVEL SECURITY;

-- 정책 설정 (모두 읽기/쓰기 가능)
CREATE POLICY "Anyone can read RSVP" ON rsvp FOR SELECT USING (true);
CREATE POLICY "Anyone can insert RSVP" ON rsvp FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read photos" ON guest_photos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert photos" ON guest_photos FOR INSERT WITH CHECK (true);
```

4. "Run" 클릭
5. "Success" 메시지 확인

### 2-3. Storage 버킷 생성

1. 왼쪽 메뉴 → "Storage" 클릭
2. "Create a new bucket" 클릭
3. 입력:
   - Name: `guest-photos`
   - Public bucket: **체크 (중요!)**
4. "Create bucket" 클릭

### 2-4. API 키 복사

1. 왼쪽 메뉴 → "Settings" → "API" 클릭
2. 복사할 값 2개:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGc...` (긴 문자열)

---

## 🔐 Step 3: 환경변수 설정

### 3-1. .env.local 파일 생성

프로젝트 폴더에서:

```bash
# .env.example을 .env.local로 복사
copy .env.example .env.local
```

### 3-2. .env.local 파일 수정

메모장으로 `.env.local` 열기:

```env
# Step 2-4에서 복사한 값 붙여넣기
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# 예식 정보 (선택사항)
NEXT_PUBLIC_WEDDING_DATE=2026-06-14
NEXT_PUBLIC_WEDDING_TIME=14:00
NEXT_PUBLIC_WEDDING_VENUE=서울 웨딩홀
```

저장 후 닫기.

---

## 💻 Step 4: 로컬 테스트

### 4-1. 개발 서버 실행

```bash
npm run dev
```

### 4-2. 브라우저에서 확인

http://localhost:3000 접속

**확인 사항**:
- ✅ 페이지가 정상적으로 보이는가?
- ✅ 어르신 모드 토글이 동작하는가?
- ✅ RSVP 제출이 되는가?

---

## 🌐 Step 5: Vercel 배포

### 5-1. GitHub에 코드 업로드

```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit: 스몰 웨딩 청첩장"

# GitHub 저장소 생성 후
git remote add origin https://github.com/your-username/wedding-invitation.git
git push -u origin main
```

### 5-2. Vercel 배포

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "Add New" → "Project" 클릭
4. GitHub 저장소 선택 (`wedding-invitation`)
5. "Environment Variables" 섹션에서 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Step 2-4 값)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Step 2-4 값)
6. "Deploy" 클릭 (2-3분 대기)

### 5-3. 배포 완료!

```
✅ 배포 완료!
URL: https://your-app.vercel.app
```

---

## 🎨 Step 6: 커스터마이징

### 6-1. 디자인 적용 (Google AI Studio 결과)

`tailwind.config.ts` 파일 수정:

```ts
colors: {
  primary: "#7C9473",    // AI Studio에서 받은 색상
  secondary: "#D4A574",
  accent: "#F9F6F2",
  text: "#3C3C3C",
}
```

### 6-2. 예식 정보 수정

`app/components/EventInfo.tsx` 수정:

```tsx
// 실제 정보로 변경
const weddingInfo = {
  date: "2026년 6월 14일 토요일",
  time: "오후 2시",
  venue: "실제 웨딩홀 이름",
  address: "실제 주소"
};
```

### 6-3. 계좌 정보 수정

`app/components/GiftInfo.tsx` 수정:

```tsx
const groomAccount = {
  bank: '국민은행',
  account: '123-456-789012',  // 실제 계좌번호
  holder: '홍길동'             // 실제 이름
};
```

### 6-4. 이미지 추가

1. `public/` 폴더에 사진 복사
2. `app/components/PhotoGallery.tsx`에서 경로 수정

### 6-5. 재배포

```bash
git add .
git commit -m "디자인 및 정보 업데이트"
git push
```

Vercel이 자동으로 재배포합니다! (1-2분)

---

## 📱 Step 7: 카카오톡 공유 설정

### 7-1. 메타 태그 확인

`app/layout.tsx`에서 정보 수정:

```tsx
export const metadata: Metadata = {
  title: "신랑 ♥ 신부 결혼합니다",
  description: "우리만의 작은 축제에 초대합니다",
  openGraph: {
    images: ["/hero-bg.jpg"], // public 폴더의 이미지
  },
};
```

### 7-2. 공유 테스트

1. 휴대폰으로 URL 접속
2. 카카오톡 공유 버튼 클릭
3. 썸네일과 텍스트 확인

---

## 🆘 문제 해결

### "npm install" 실패

```bash
# Node.js 버전 확인 (18 이상 필요)
node -v

# 캐시 삭제 후 재시도
npm cache clean --force
npm install
```

### "Cannot find module" 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### 브라우저 캐시 문제

```bash
# .next 폴더 삭제
rm -rf .next

# 새 포트로 재시작
npm run dev -- -p 3001
```

### Vercel 배포 실패

1. 환경변수 확인 (NEXT_PUBLIC_ 접두사 확인)
2. Git 푸시 확인 (코드가 올라갔는지)
3. Vercel 로그 확인 (상세 오류 메시지)

---

## ✅ 최종 체크리스트

배포 전 확인사항:

- [ ] Supabase 테이블 생성 완료
- [ ] Storage 버킷 생성 (Public 설정)
- [ ] 환경변수 설정 (.env.local)
- [ ] 로컬 테스트 완료
- [ ] 예식 정보 수정
- [ ] 계좌 정보 수정
- [ ] 이미지 업로드
- [ ] GitHub 푸시
- [ ] Vercel 배포 완료
- [ ] 카카오톡 공유 테스트

---

## 📞 지원

문제가 해결되지 않으면:

1. `PROJECT_PLAN.md` 참고
2. `README.md` 트러블슈팅 섹션 확인
3. Supabase/Vercel 공식 문서 참고

**축하합니다! 🎉**
