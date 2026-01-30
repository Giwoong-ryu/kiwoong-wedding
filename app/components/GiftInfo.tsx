'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountInfo {
  bank: string;
  account: string;
  holder: string;
}

export default function GiftInfo() {
  const [isOpen, setIsOpen] = useState(false);

  // 실제 계좌 정보로 업데이트 필요
  const groomAccount: AccountInfo = {
    bank: '국민은행',
    account: '123-456-789012',
    holder: '홍길동'
  };

  const brideAccount: AccountInfo = {
    bank: '카카오뱅크',
    account: '3333-12-3456789',
    holder: '김영희'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('계좌번호가 복사되었습니다');
  };

  return (
    <section className="section bg-bgSection">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto"
      >
        <div className="text-center mb-6">
          <span className="text-4xl mb-4 block">💝</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text">
            안내
          </h2>
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 space-y-6">
          {/* 메인 안내 문구 */}
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold text-text">
              현장에서는 축의금을<br />
              따로 받지 않습니다
            </p>

            <p className="text-lg text-text/70">
              편하게 오셔서<br />
              함께 즐겨주세요! 🎉
            </p>
          </div>

          <div className="h-px bg-text/10"></div>

          {/* 계좌 안내 */}
          <div className="text-center">
            <p className="text-base text-text/70 mb-4">
              마음 전하실 곳<br />
              아래에 안내드립니다
            </p>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white py-3 px-6 rounded-lg
                       border-2 border-primary/20
                       hover:border-primary/40 transition-colors
                       font-medium text-text"
            >
              계좌 확인하기 {isOpen ? '▲' : '▼'}
            </button>
          </div>

          {/* 계좌번호 펼치기 */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-6 pt-4">
                  {/* 신랑측 */}
                  <div className="bg-white rounded-xl p-6 space-y-3">
                    <p className="font-semibold text-text flex items-center gap-2">
                      <span>🤵</span> 신랑측
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-text/70">🏦 {groomAccount.bank}</p>
                      <p className="text-base font-mono text-text">
                        {groomAccount.account}
                      </p>
                      <p className="text-text/70">예금주: {groomAccount.holder}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(groomAccount.account)}
                      className="w-full bg-primary/10 text-primary py-2 rounded-lg
                               hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      복사하기
                    </button>
                  </div>

                  {/* 신부측 */}
                  <div className="bg-white rounded-xl p-6 space-y-3">
                    <p className="font-semibold text-text flex items-center gap-2">
                      <span>👰</span> 신부측
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-text/70">🏦 {brideAccount.bank}</p>
                      <p className="text-base font-mono text-text">
                        {brideAccount.account}
                      </p>
                      <p className="text-text/70">예금주: {brideAccount.holder}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(brideAccount.account)}
                      className="w-full bg-primary/10 text-primary py-2 rounded-lg
                               hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      복사하기
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
