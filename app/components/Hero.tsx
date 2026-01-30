'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section
      className="h-screen relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{
        backgroundImage: `url('https://picsum.photos/seed/wedding1/800/1200')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* 컨텐츠 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-white"
      >
        <p className="text-base mb-4 font-medium uppercase tracking-[0.2em]">
          Our Own Small Festival
        </p>
        <h1 className="text-5xl md:text-7xl font-serif font-extrabold mb-2">
          준수 & 민지
        </h1>
        <p className="text-base mt-8">2026. 06. 14. SAT PM 2:00</p>
        <p className="text-base">서울 웨딩홀</p>
      </motion.div>

      {/* 스크롤 힌트 */}
      <motion.div
        className="absolute bottom-10 text-white"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
