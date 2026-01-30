'use client';

import { motion } from 'framer-motion';

export default function Map() {
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent('서울시 강남구 테헤란로 123')}`;

  return (
    <section className="section py-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto"
      >
        <div className="rounded-3xl overflow-hidden shadow-inner bg-slate-200 aspect-video flex items-center justify-center relative group">
          <img
            src="https://picsum.photos/seed/map/800/450"
            alt="Map Placeholder"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <a
              href={naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 backdrop-blur px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
            >
              네이버 지도 열기
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
