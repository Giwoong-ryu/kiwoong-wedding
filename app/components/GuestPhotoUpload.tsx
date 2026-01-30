'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';

export default function GuestPhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  // 실시간 사진 불러오기
  useEffect(() => {
    loadPhotos();

    // Supabase Realtime으로 새 사진 즉시 반영
    const channel = supabase
      .channel('guest_photos')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'guest_photos'
      }, () => {
        loadPhotos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('guest_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPhotos(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < Math.min(files.length, 10); i++) {
        const file = files[i];

        // 이미지 압축 (5MB → 1MB 이하)
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });

        // Supabase Storage 업로드
        const fileName = `${Date.now()}-${i}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('guest-photos')
          .upload(fileName, compressed);

        if (uploadError) throw uploadError;

        // Public URL 가져오기
        const { data: { publicUrl } } = supabase.storage
          .from('guest-photos')
          .getPublicUrl(fileName);

        // DB에 저장
        await supabase
          .from('guest_photos')
          .insert([{ photo_url: publicUrl }]);
      }

      alert('사진이 업로드되었습니다! 감사합니다 📸');
      e.target.value = ''; // 입력 초기화
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="section bg-accent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">📷</span>
          <h2 className="section-title">추억 함께 만들기</h2>
          <p className="text-text/60 mt-2">
            오늘의 즐거운 순간을<br />
            함께 공유해주세요!
          </p>
        </div>

        {/* 업로드 버튼 */}
        <div className="max-w-md mx-auto mb-12">
          <label
            htmlFor="photo-upload"
            className="block w-full bg-primary text-white py-4 px-8 rounded-lg
                     font-semibold text-center cursor-pointer
                     hover:bg-primary/90 transition-colors text-lg"
          >
            {uploading ? '업로드 중...' : '📸 사진 올리기'}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <p className="text-center text-sm text-text/60 mt-2">
            최대 10장까지 한 번에 업로드 가능
          </p>
        </div>

        {/* 실시간 갤러리 */}
        {photos.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-text/70 mb-6">
              실시간 갤러리 ↓ ({photos.length}장)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded-xl overflow-hidden shadow-lg"
                >
                  <Image
                    src={photo.photo_url}
                    alt="하객 사진"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
