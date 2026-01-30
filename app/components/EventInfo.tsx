'use client';

import { motion } from 'framer-motion';

export default function EventInfo() {
  return (
    <section className="section bg-bgSection">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto"
      >
        <div className="rounded-3xl p-8 shadow-sm border border-slate-100 bg-bgSection">
          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-serif font-extrabold mb-2">
              언제
            </h3>
            <p className="text-base text-text">2026년 6월 14일 토요일</p>
            <p className="text-base font-bold text-primary">오후 2시</p>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-serif font-extrabold mb-2">
              어디서
            </h3>
            <p className="text-base text-text">서울 웨딩홀</p>
            <p className="text-sm text-text/70">서울특별시 강남구 테헤란로 123</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
