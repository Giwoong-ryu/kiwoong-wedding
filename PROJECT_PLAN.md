# 스몰 웨딩 청첩장 프로젝트 플랜

> 2026-01-30 작성
> Master Router 검증 완료 | Pillar v4.0 적용

---

## 📋 프로젝트 개요

### 기본 정보
- **프로젝트명**: Small Wedding Invitation (스몰 웨딩 청첩장)
- **목적**: 30-40명 친한 지인 대상 모바일 청첩장 웹앱
- **컨셉**: "우리만의 작은 축제" - 격식 없고 따뜻한 분위기
- **예상 일정**: 3주 (MVP 2주 + QA 1주)
- **예산**: 0원 (도메인 제외)

### 핵심 특징
1. ✅ 축의금 현장 수령 안 함 (계좌는 제공)
2. ✅ 어르신 모드 (큰 글씨 + 단순 UI)
3. ✅ 하객 사진 실시간 업로드
4. ✅ 스몰 웨딩 최적화 (30-40명)

---

## 🛠️ 기술 스택

### Frontend
```
Framework: Next.js 15 (App Router)
Styling: Tailwind CSS
Animation: Framer Motion
Language: TypeScript
```

**선택 이유**:
- Next.js 15: 최신 안정화, 이미지 최적화, Vercel 무료 배포
- Tailwind: 빠른 개발, 반응형 쉬움
- Framer Motion: 부드러운 애니메이션, 간단한 API

### Backend
```
Database: Supabase (PostgreSQL)
Storage: Supabase Storage
Auth: Supabase Auth (관리자용)
Real-time: Supabase Realtime
```

**선택 이유**:
- 무료 Tier로 충분 (500MB DB, 1GB Storage)
- 실시간 기능 내장 (하객 사진 즉시 반영)
- API 자동 생성

### Deployment
```
Hosting: Vercel
CDN: Cloudflare (자동)
Domain: 선택사항 (15,000원/년)
```

---

## 📱 기능 명세 (7가지)

### 1. 메인 화면 + 어르신 모드
- **우선순위**: P0 (필수)
- **기능**:
  - 히어로 이미지 (커플 사진)
  - 날짜, 장소, 초대 문구
  - 우측 상단 "어르신 모드" 토글 버튼
- **어르신 모드 동작**:
  - 글씨 크기 1.8배
  - 복잡한 섹션 숨김 (갤러리, 하객 사진)
  - 핵심 버튼만 표시 (오시는 길, RSVP)
- **난이도**: 쉬움
- **예상 시간**: 1일

### 2. 축의금 안내
- **우선순위**: P0 (필수)
- **문구**: "현장에서는 축의금을 받지 않습니다 / 마음 전하실 곳 아래에 안내드립니다"
- **기능**:
  - 기본 상태: 접힌 상태
  - "계좌 확인하기" 버튼 클릭 시 펼침
  - 신랑측/신부측 탭 구분
  - 계좌 복사 버튼
  - Toss/카카오페이 딥링크 (선택)
- **난이도**: 쉬움
- **예상 시간**: 0.5일

### 3. RSVP (참석 확인)
- **우선순위**: P0 (필수)
- **필드**:
  - 이름 (필수)
  - 참석 여부 (참석/불참)
  - 동행 인원 (0-5명)
  - 한마디 (선택)
- **기술**:
  - Supabase Insert
  - 실시간 응답 수 표시 (선택)
- **난이도**: 쉬움
- **예상 시간**: 1일

### 4. 포토 갤러리
- **우선순위**: P1 (중요)
- **기능**:
  - 최대 60장
  - Masonry Grid (세로/가로 자동 배치)
  - Lightbox 확대 보기
  - Lazy Loading (스크롤 시 로드)
- **이미지 최적화**:
  - next/image 자동 WebP 변환
  - 3가지 사이즈 (400px, 800px, 1920px)
  - CDN 캐싱
- **난이도**: 중간
- **예상 시간**: 2일

### 5. 오시는 길
- **우선순위**: P0 (필수)
- **기능**:
  - 네이버/카카오맵 임베드
  - 주소 표시
  - "길찾기" 버튼 (네이버/카카오맵 앱 실행)
  - 교통편 안내 (지하철, 버스, 주차)
- **난이도**: 쉬움
- **예상 시간**: 0.5일

### 6. 하객 사진 업로드
- **우선순위**: P2 (있으면 좋음)
- **기능**:
  - 사진 선택 (최대 10장)
  - 프론트엔드 압축 (1MB 이하)
  - Supabase Storage 업로드
  - 실시간 갤러리 표시
  - 신랑신부 관리자 페이지에서 ZIP 다운로드
- **위험 요소**:
  - 현장 WiFi 불안정 가능성
  - 동시 업로드 병목
- **대응책**:
  - 업로드 재시도 로직
  - "나중에 업로드" 옵션
  - 결혼식 후 이메일 수집 대체안
- **난이도**: 중간-높음
- **예상 시간**: 2일

### 7. 공유 기능
- **우선순위**: P0 (필수)
- **기능**:
  - 카카오톡 공유 (썸네일 최적화 1:2 비율)
  - 링크 복사
  - QR 코드 생성 (선택)
- **난이도**: 쉬움
- **예상 시간**: 0.5일

---

## 📅 개발 일정 (3주)

### Week 1: 기반 구축
```
Day 1-2: 프로젝트 세팅
  □ Next.js 15 초기화
  □ Tailwind CSS 설정
  □ Supabase 프로젝트 생성
  □ 환경변수 설정
  □ Git 초기화

Day 3-4: 메인 화면
  □ 레이아웃 구조
  □ 히어로 섹션
  □ 어르신 모드 토글
  □ 초대 문구
  □ 예식 정보

Day 5-7: RSVP + 축의금
  □ RSVP 폼 UI
  □ Supabase 연동
  □ 축의금 안내 (접기/펼치기)
  □ 계좌 복사 기능
```

### Week 2: 고급 기능
```
Day 8-10: 포토 갤러리
  □ Masonry Grid 구현
  □ Lightbox 추가
  □ next/image 최적화
  □ Lazy Loading

Day 11-12: 하객 사진 업로드
  □ 업로드 UI
  □ 이미지 압축
  □ Supabase Storage 연동
  □ 실시간 갤러리

Day 13-14: 지도 + 공유
  □ 네이버/카카오맵 임베드
  □ 카카오톡 공유
  □ 링크 복사
  □ 최종 테스트
```

### Week 3: QA & 배포
```
Day 15-17: 사용성 테스트
  □ 어르신 1-2명 테스트
  □ 친구 5명 베타 테스트
  □ 피드백 수집
  □ 이슈 리스트업

Day 18-20: 버그 수정
  □ 크로스 브라우저 테스트
  □ 이미지 로딩 최적화
  □ 디자인 미세 조정
  □ 성능 튜닝

Day 21: 최종 배포
  □ Vercel 프로덕션 배포
  □ 도메인 연결 (선택)
  □ 카카오톡 공유 테스트
  □ 백업 링크 생성
```

---

## 📂 파일 구조

```
WDDING/
├── app/
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── page.tsx                   # 메인 페이지
│   ├── globals.css                # 전역 스타일
│   ├── components/
│   │   ├── Hero.tsx               # 히어로 섹션
│   │   ├── SeniorModeToggle.tsx   # 어르신 모드 토글
│   │   ├── Invitation.tsx         # 초대 문구
│   │   ├── EventInfo.tsx          # 예식 정보
│   │   ├── GiftInfo.tsx           # 축의금 안내
│   │   ├── RSVP.tsx               # 참석 확인 폼
│   │   ├── PhotoGallery.tsx       # 포토 갤러리
│   │   ├── Map.tsx                # 오시는 길
│   │   └── GuestPhotoUpload.tsx   # 하객 사진 업로드
│   └── api/
│       ├── rsvp/route.ts          # RSVP API
│       └── photos/route.ts        # 사진 업로드 API
├── lib/
│   ├── supabase.ts                # Supabase 클라이언트
│   └── utils.ts                   # 유틸리티 함수
├── public/
│   ├── hero-bg.jpg                # 히어로 배경 이미지
│   ├── couple-photo.jpg           # 커플 사진
│   └── icons/                     # 아이콘들
├── types/
│   └── index.ts                   # TypeScript 타입 정의
├── .env.local                     # 환경변수 (git ignore)
├── .env.example                   # 환경변수 예시
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── PROJECT_PLAN.md                # 이 파일
```

---

## 🚨 Pillar v4.0 적용

### Stage 0: Pre-start Check
```bash
python tools/precheck.py "스몰 웨딩 청첩장 Next.js React"
```

**경고 받음**:
- `browser-cache-prevents-code-update`: Next.js 개발 시 .next 삭제 필수

### 개발 중 주의사항
1. **브라우저 캐시 문제**
   - 증상: 코드 수정했는데 반영 안 됨
   - 해결: `.next` 삭제 + 새 포트로 재시작 (3001)

2. **DB 필드 네이밍**
   - Supabase: snake_case
   - Frontend: camelCase
   - 해결: 양쪽 모두 fallback 지원

3. **이미지 최적화**
   - next/image 사용 필수
   - WebP 자동 변환
   - Lazy Loading 활성화

### Stage Final (완료 후 실행)
```bash
# 커밋 전 검증
python check_final.py

# 또는 /c 명령어
/c "feat: 스몰 웨딩 청첩장 초기 구조"
```

---

## ⚠️ 위험 요소 및 대응책

### 1. 이미지 최적화 (고화질 유지)
**문제**: 60장 × 5MB = 300MB → 느린 로딩

**대응책**:
- ✅ next/image 자동 WebP 변환 (80% 압축)
- ✅ Lazy Loading (스크롤 시 로드)
- ✅ 3가지 사이즈 생성 (400/800/1920px)
- ✅ Cloudflare CDN (Vercel 자동)

**예상 결과**: 300MB → 60MB, 로딩 80초 → 8초

### 2. 어르신 모드 사용성
**문제**: 글씨만 크게 하면 레이아웃 깨짐

**대응책**:
- ✅ 사전 테스트 (어르신 1-2명)
- ✅ 복잡한 UI 숨김
- ✅ 대안: "전화로 참석 확인"

**예상 성공률**: 60% → 85% (테스트 후)

### 3. 하객 사진 업로드 (현장 네트워크)
**문제**: 웨딩홀 WiFi 불안정, 30명 동시 업로드

**대응책**:
- ✅ 프론트엔드 압축 (5MB → 1MB)
- ✅ 업로드 재시도 로직
- ✅ "나중에 업로드" 옵션
- ✅ 보험: 결혼식 후 이메일 수집

**예상 성공률**: 50% → 80%

### 4. 2주 일정 (빡빡함)
**문제**: 디자인 QA, 테스트 시간 부족

**대응책**:
- ✅ 현실적 일정: 3주 (MVP 2주 + QA 1주)
- ✅ 우선순위 분리 (P0, P1, P2)
- ✅ P2 기능은 결혼식 후 추가 가능

---

## 💰 예상 비용 (3개월)

| 항목 | 무료 Tier | 예상 사용량 | 초과 시 비용 |
|------|-----------|-------------|-------------|
| Vercel | 100GB 대역폭 | ~5GB | 0원 |
| Supabase DB | 500MB | ~10MB | 0원 |
| Supabase Storage | 1GB | ~200MB | 0원 |
| 도메인 | - | - | 15,000원/년 |
| **총계** | **0원** | - | **15,000원** |

---

## 🎯 성공 지표

### 기술적 목표
- ✅ Lighthouse 점수 90+ (Performance, Accessibility)
- ✅ 첫 로딩 시간 3초 이내
- ✅ 모바일 최적화 (90% 모바일 사용 예상)

### 사용자 목표
- ✅ RSVP 응답률 80%+ (30-40명 중 24-32명)
- ✅ 어르신 모드 사용률 측정
- ✅ 하객 사진 업로드 20장+ (성공 시)

---

## 🚀 다음 단계

1. ✅ **플랜 문서화 완료** (이 파일)
2. ⏳ **디자인 확정** (Google AI Studio 요청 중)
3. ⏳ **코드 생성 시작**
   - Next.js 프로젝트 초기화
   - 기본 컴포넌트 7개
   - Supabase 연동
4. ⏳ **첫 배포** (Vercel)

---

## 📝 참고 자료

### 학습한 패턴 (patterns.json)
- `browser-cache-prevents-code-update`: 브라우저 캐시 문제
- `db-field-naming-snake-vs-camel`: DB 필드 네이밍

### 기술 문서
- Next.js 15: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/

---

**작성일**: 2026-01-30
**작성자**: Claude Code (Master Router 검증)
**버전**: 1.0
**상태**: 디자인 대기 중 → 코드 생성 준비 완료
