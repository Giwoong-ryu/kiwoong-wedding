import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SOFT_SAGE 테마 (festival-wedding-invite-2026 디자인 시스템)
        primary: "#6B8E23",      // Soft Sage (자연스러운 녹색)
        secondary: "#F5F5DC",    // Beige (따뜻한 베이지)
        accent: "#FAFAF8",       // Off-white (부드러운 흰색)
        bgMain: "#FAF9F6",       // 메인 배경
        bgSection: "#FFFFFF",    // 섹션 배경
        text: "#2D3436",         // 메인 텍스트
        textMuted: "#636E72",    // 보조 텍스트
      },
      fontFamily: {
        // SOFT_SAGE 테마 폰트
        serif: ["Noto Serif KR", "serif"],    // 타이틀용
        sans: ["Pretendard", "sans-serif"],   // 본문용
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
