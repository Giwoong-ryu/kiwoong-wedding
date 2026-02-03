import type { Metadata } from "next";
import { Great_Vibes, Noto_Serif_KR } from 'next/font/google';
import "./globals.css";

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wedding-invitation.vercel.app'),
  title: "Kiwoong Gyeoul Wedding",
  description: "March 28, 2026 Saturday 2PM at Lascos Wedding Hall",
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "Kiwoong Gyeoul Wedding",
    description: "March 28, 2026 Saturday 2PM",
    images: ["/main.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${greatVibes.variable} ${notoSerifKR.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
