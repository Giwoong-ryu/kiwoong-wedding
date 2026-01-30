import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_KR } from 'next/font/google';
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "신랑 ♥ 신부 결혼합니다",
  description: "우리만의 작은 축제에 초대합니다 - 2026년 6월 14일",
  openGraph: {
    title: "신랑 ♥ 신부 결혼합니다",
    description: "우리만의 작은 축제에 초대합니다",
    images: ["/hero-bg.jpg"], // 디자인 이미지 업로드 후 업데이트
  },
  // 카카오톡 공유 최적화
  other: {
    'kakao:title': "신랑 ♥ 신부 결혼합니다",
    'kakao:description': "2026년 6월 14일 토요일 오후 2시",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${cormorant.variable} ${notoSerifKR.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
