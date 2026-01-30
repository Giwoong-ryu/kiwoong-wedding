'use client';

import { motion } from 'framer-motion';

export default function Invitation() {
  return (
    <section className="section bg-bgSection">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-md mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-serif font-extrabold mb-8 text-primary">
          소중한 당신을 초대합니다
        </h2>

        <div className="text-base leading-relaxed space-y-4 font-light italic text-text/80">
          <p>좋은 날, 좋은 사람들과 함께</p>
          <p>작은 축제를 열고자 합니다.</p>
          <p className="mt-6">격식 없이 가볍게 오셔서</p>
          <p>저희의 새로운 시작을</p>
          <p>축복해 주시면 감사하겠습니다.</p>
        </div>

        <div className="mt-12 h-px w-20 mx-auto bg-slate-300" />
      </motion.div>
    </section>
  );
}
