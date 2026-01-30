'use client';

import { motion } from 'framer-motion';

const photos = [
  { id: 1, src: 'https://picsum.photos/seed/wed2/400/600', tall: true },
  { id: 2, src: 'https://picsum.photos/seed/wed3/400/400', tall: false },
  { id: 3, src: 'https://picsum.photos/seed/wed4/400/400', tall: false },
  { id: 4, src: 'https://picsum.photos/seed/wed5/400/600', tall: true },
];

export default function PhotoGallery() {
  return (
    <section className="section bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-center mb-10">
          우리의 기록
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, index) => (
            <motion.img
              key={photo.id}
              src={photo.src}
              alt={`Gallery ${index + 1}`}
              className={`rounded-2xl object-cover w-full ${
                index === 0 ? 'h-64 row-span-2' :
                index === 1 ? 'h-32 mt-auto' :
                index === 2 ? 'h-32 mb-auto' :
                'h-64 row-span-2'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
