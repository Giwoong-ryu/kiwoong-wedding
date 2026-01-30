'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { RSVPFormData } from '@/types';

export default function RSVP() {
  const [formData, setFormData] = useState<RSVPFormData>({
    name: '',
    attending: 'yes',
    guestCount: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('rsvp')
        .insert([{
          name: formData.name,
          attending: formData.attending,
          guest_count: formData.guestCount,
          message: formData.message || null
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      alert('참석 여부가 등록되었습니다! 감사합니다 💝');
    } catch (error) {
      console.error('RSVP 제출 실패:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="section bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center bg-primary/10 rounded-2xl p-12"
        >
          <span className="text-6xl mb-4 block">✅</span>
          <h3 className="text-2xl font-bold mb-4 text-text">
            참석 여부가 등록되었습니다!
          </h3>
          <p className="text-text/70">
            감사합니다 💝
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="section bg-bgSection">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">📋</span>
          <h2 className="section-title">참석해주실 수 있나요?</h2>
          <p className="text-text/60 mt-2">
            30-40명 정도의 작은 모임이라<br />
            인원 파악이 필요해요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-accent rounded-2xl p-8 space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-text/10
                       focus:border-primary outline-none transition-colors"
              placeholder="홍길동"
            />
          </div>

          {/* 참석 여부 */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              참석 여부
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: 'yes' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.attending === 'yes'
                    ? 'bg-primary text-white'
                    : 'bg-white text-text border-2 border-text/10'
                }`}
              >
                참석합니다! 🎉
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: 'no' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.attending === 'no'
                    ? 'bg-text/70 text-white'
                    : 'bg-white text-text border-2 border-text/10'
                }`}
              >
                아쉽지만 불참해요
              </button>
            </div>
          </div>

          {/* 동행 인원 */}
          {formData.attending === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                동행하시는 분
              </label>
              <div className="flex items-center justify-center gap-4 bg-white rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    guestCount: Math.max(0, formData.guestCount - 1)
                  })}
                  className="w-12 h-12 rounded-full bg-text/10 hover:bg-text/20
                           transition-colors font-bold text-xl"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-text w-12 text-center">
                  {formData.guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    guestCount: Math.min(5, formData.guestCount + 1)
                  })}
                  className="w-12 h-12 rounded-full bg-text/10 hover:bg-text/20
                           transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* 한마디 */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              한마디 (선택사항)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-text/10
                       focus:border-primary outline-none transition-colors
                       resize-none"
              rows={3}
              placeholder="축하 메시지를 남겨주세요"
            />
          </div>

          {/* 제출 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-4 rounded-lg font-semibold
                     hover:bg-primary/90 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
