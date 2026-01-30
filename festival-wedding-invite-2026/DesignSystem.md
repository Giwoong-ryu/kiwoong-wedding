
# 2026 스몰 웨딩 청첩장 디자인 시스템

### 1. 색상 팔레트 (Color Palette)
- **Primary**: `#6B8E23` (Soft Sage) / `#E67E22` (Terracotta) / `#9B59B6` (Amethyst)
- **Secondary**: `#F5F5DC` (Beige) - 자연스럽고 따뜻한 질감
- **배경색**: `#FAF9F6` (Off-white) - 눈의 피로도를 낮추고 고급스러운 느낌
- **텍스트**: `#2D3436` - 완전한 검정색이 아닌 짙은 차콜로 모던함 유지

### 2. 타이포그래피 (Typography)
- **제목**: `Noto Serif KR` - 700 (Bold). 클래식하면서도 세련된 인상
- **본문**: `Pretendard` - 400/600 (Medium/Semibold). 높은 가독성과 모던한 인상
- **어르신 모드**: 기본 크기의 **1.5배~2배**로 확대. 굵기를 한 단계 높여(Bold/Black) 대비를 극대화함.

### 3. 레이아웃 가이드 (Layout)
- **섹션 순서**: Hero → 초대 문구 → 갤러리 → 일정/장소 → 지도 → 축의금 안내 → RSVP
- **여백 시스템**: 섹션 간 여백을 최소 `80px` 이상 확보하여 시각적 여유 제공 (Small Festival 컨셉)
- **모바일 우선**: 모든 요소는 한 손 조작이 가능하도록 하단 버튼 배치를 선호함.

### 4. 애니메이션 제안
- **Scroll Reveal**: 섹션이 화면에 진입할 때 `Y축 20px` 이동과 함께 `Opacity 0 -> 1` 페이드인 효과.
- **Micro-interaction**: 버튼 클릭 시 `Scale 0.95`로 줄어드는 햅틱 반응 시뮬레이션.

### 5. 특별 섹션 디자인
- **축의금 섹션**: "축의금 사양" 문구를 최상단에 배치하되, 앰버(Amber) 컬러를 사용하여 따뜻하지만 단호한 느낌 전달. 계좌번호는 `Accordion` UI를 사용하여 필요시에만 노출.
- **어르신 모드**: 하단 플로팅 버튼으로 상시 접근 가능. 모드 활성화 시 이미지 중심보다는 텍스트 중심으로 레이아웃 재배치 및 가독성 최우선.

### 6. Tailwind CSS 클래스 예시
```html
<!-- 메인 제목 -->
<h1 class="text-3xl font-extrabold serif tracking-tight text-slate-900 leading-tight">

<!-- 어르신 모드 버튼 -->
<button class="fixed bottom-6 right-6 shadow-2xl px-8 py-5 rounded-full font-black text-xl bg-slate-900 text-white">

<!-- 초대장 카드 섹션 -->
<div class="rounded-[2.5rem] bg-[#F0F4EF] p-10 shadow-sm border border-slate-100">
```
