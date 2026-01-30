'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  saveRSVP,
  uploadPhoto,
  getPhotos,
  subscribeToPhotos,
  saveGuestbook,
  getGuestbook,
  subscribeToGuestbook,
  deleteGuestbook,
  type Photo,
  type GuestbookEntry
} from './lib/supabase';
import imageCompression from 'browser-image-compression';

// SOFT_SAGE 테마 상수 (웨딩 감성 업그레이드)
const theme = {
  primary: '#8BA888',      // 부드러운 Sage Green
  secondary: '#F5F5DC',    // Beige
  gold: '#D4AF37',         // 골드 악센트
  bgMain: '#FAF9F6',       // Off-white
  bgSection: '#FFFFFF',    // White
  bgPastel1: '#F0F4F0',    // 연한 Sage
  bgPastel2: '#FFF9F0',    // 크림
  bgGradient: 'linear-gradient(135deg, #F0F4F0 0%, #FFF9F0 100%)',
  textMain: '#2D3436',     // Dark Gray
  textMuted: '#636E72',    // Medium Gray
};

export default function Home() {
  const [isSeniorMode, setIsSeniorMode] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [hasShownAutoPopup, setHasShownAutoPopup] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    attending: 'yes',
    guest_count: 1,
    child_count: 0,
    message: ''
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [guestbookForm, setGuestbookForm] = useState({ name: '', message: '', password: '' });

  // D-Day 카운터
  useEffect(() => {
    const weddingDate = new Date('2026-03-28T12:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // 사진 로드 및 실시간 구독
  useEffect(() => {
    // 초기 사진 로드
    getPhotos()
      .then(setPhotos)
      .catch((err) => {
        console.error('사진 로드 실패:', err);
        setPhotos([]); // 에러 시 빈 배열로 설정
      });

    // 실시간 구독
    const subscription = subscribeToPhotos((newPhoto) => {
      setPhotos((prev) => [newPhoto, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 방명록 로드 및 실시간 구독
  useEffect(() => {
    getGuestbook().then(setGuestbook);

    const subscription = subscribeToGuestbook((newEntry) => {
      setGuestbook((prev) => [newEntry, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // URL 파라미터에서 게스트 이름 읽기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('guest');
    if (name) {
      const decodedName = decodeURIComponent(name);
      setGuestName(decodedName);
      // RSVP 폼 이름도 미리 채우기
      setFormData(prev => ({ ...prev, name: decodedName }));
    }
  }, []);

  // 스크롤 자동 팝업 (지도 섹션 지나서)
  useEffect(() => {
    const handleScroll = () => {
      // 이미 팝업을 표시했거나, 모달이 이미 열려있으면 무시
      if (hasShownAutoPopup || isRsvpOpen) return;

      // localStorage 체크: "오늘 하루 보지 않기" 확인
      const hideUntil = localStorage.getItem('hideRsvpUntil');
      if (hideUntil && new Date().getTime() < parseInt(hideUntil)) {
        return;
      }

      // 페이지 스크롤 75% 체크 (지도까지 보고 난 후)
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercentage > 75) {
        setIsRsvpOpen(true);
        setHasShownAutoPopup(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShownAutoPopup, isRsvpOpen]);

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${name} 계좌번호가 복사되었습니다.`);
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: '기웅 & 겨울 결혼합니다',
      text: '2026년 3월 28일 금요일 낮 12시\n라스코스 웨딩홀에서 저희 두 사람의 작은 축제에 초대합니다.',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Web Share API 미지원 시 링크 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  const handleSubmitGuestbook = async () => {
    if (!guestbookForm.name.trim() || !guestbookForm.message.trim() || !guestbookForm.password.trim()) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (guestbookForm.password.length < 4) {
      alert('비밀번호는 4자리 이상 입력해주세요.');
      return;
    }

    try {
      await saveGuestbook(guestbookForm);
      alert('방명록이 등록되었습니다!');
      setGuestbookForm({ name: '', message: '', password: '' });
    } catch (error) {
      console.error('방명록 등록 오류:', error);
      alert('방명록 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteGuestbook = async (id: number) => {
    const password = prompt('비밀번호를 입력하세요:');
    if (!password) return;

    try {
      await deleteGuestbook(id, password);
      setGuestbook((prev) => prev.filter((entry) => entry.id !== id));
      alert('방명록이 삭제되었습니다.');
    } catch (error: any) {
      alert(error.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 이미지 압축
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };

        const compressedFile = await imageCompression(file, options);

        // Supabase에 업로드
        await uploadPhoto(compressedFile);
      }

      alert('사진이 업로드되었습니다!');
      e.target.value = ''; // input 초기화
    } catch (error) {
      console.error('사진 업로드 오류:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitRSVP = async () => {
    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      await saveRSVP({
        name: formData.name,
        attending: formData.attending as 'yes' | 'no',
        guest_count: formData.attending === 'yes' ? formData.guest_count : 0,
        message: formData.message || undefined
      });

      alert('참석 의사가 전달되었습니다. 감사합니다!');
      setIsRsvpOpen(false);
      setFormData({ name: '', attending: 'yes', guest_count: 1, message: '' });
    } catch (error) {
      console.error('RSVP 저장 오류:', error);
      alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const t = isSeniorMode ? {
    h1: 'text-5xl font-black leading-tight',
    h2: 'text-4xl font-black leading-tight',
    body: 'text-2xl font-semibold leading-relaxed tracking-wide',
  } : {
    h1: 'text-3xl md:text-4xl font-extrabold tracking-tight',
    h2: 'text-2xl md:text-3xl font-extrabold tracking-tight',
    body: 'text-base',
  };

  return (
    <main className="min-h-screen transition-colors duration-500" style={{ backgroundColor: theme.bgMain, color: theme.textMain }}>
      {/* 어르신 모드 토글 */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsSeniorMode(!isSeniorMode)}
          className={`shadow-xl px-6 py-4 rounded-full font-bold transition-all transform active:scale-95 ${
            isSeniorMode ? 'bg-slate-900 text-white scale-110' : 'bg-white text-slate-900 border-2 border-slate-200'
          }`}
        >
          {isSeniorMode ? '어르신 모드 ON' : '어르신 모드 OFF'}
        </button>
      </div>

      {/* 1. Hero Section */}
      <section
        className="h-screen relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ backgroundImage: `url('https://picsum.photos/seed/wedding1/800/1200')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white"
        >
          <p className={`${t.body} mb-6 font-medium uppercase tracking-[0.3em] opacity-90`}>Our Own Small Festival</p>

          {/* 신랑신부 이름 - 예쁜 디자인 */}
          <div className="mb-10">
            <h1
              className="text-6xl md:text-7xl font-light tracking-wider mb-3 font-cormorant"
              style={{
                textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)',
                letterSpacing: '0.1em'
              }}
            >
              기웅 <span className="text-5xl md:text-6xl opacity-70 mx-2">&</span> 겨울
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-px w-12 bg-white/50"></div>
              <span className="text-xl opacity-70">✿</span>
              <div className="h-px w-12 bg-white/50"></div>
            </div>
          </div>

          <p className={t.body + ' mt-6 tracking-wider'}>2026. 03. 28. FRI PM 12:00</p>
          <p className={t.body + ' opacity-90'}>라스코스 웨딩홀</p>
        </motion.div>

        {/* 정성을 담은 초대장 - 자막 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-20 text-white text-sm md:text-base tracking-wide opacity-75 z-10"
        >
          소중한 분들을 위해 정성껏 준비한 초대장입니다
        </motion.div>

        <motion.div className="absolute bottom-10 text-white z-10" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </motion.div>
      </section>

      {/* 2. Invitation Message */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
        className="relative py-24 px-6"
        style={{ background: theme.bgGradient }}
      >
        <div className="max-w-md mx-auto text-center">
          {/* 꽃 모티프 */}
          <div className="mb-6 text-6xl opacity-20">✿</div>

          <h2 className={`${t.h2} mb-10 text-4xl tracking-wide`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
            {guestName ? `${guestName}님을 초대합니다` : '소중한 당신을 초대합니다'}
          </h2>

          <div className={`${t.body} whitespace-pre-wrap leading-loose text-lg`} style={{ color: theme.textMuted }}>
            {`좋은 날, 좋은 사람들과 함께\n작은 축제를 열고자 합니다.\n\n격식 없이 가볍게 오셔서\n저희의 새로운 시작을\n축복해 주시면 감사하겠습니다.`}
          </div>

          <div className="mt-16 space-y-3 py-8 px-6 bg-white/60 backdrop-blur rounded-3xl">
            <div className={`${t.body} flex items-center justify-center gap-3 text-lg`}>
              <span className="opacity-70">유한성 · 김옥순</span>
              <span className="opacity-50 text-sm">의 아들</span>
              <span className="font-bold" style={{ color: theme.primary }}>기웅</span>
            </div>
            <div className={`${t.body} flex items-center justify-center gap-3 text-lg`}>
              <span className="opacity-70">서상석 · 최은희</span>
              <span className="opacity-50 text-sm">의 딸</span>
              <span className="font-bold" style={{ color: theme.primary }}>겨울</span>
            </div>
          </div>

          {/* 꽃 구분선 */}
          <div className="mt-14 flex items-center justify-center gap-3 opacity-30">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-300" />
            <span style={{ color: theme.gold }}>✿</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-300" />
          </div>
        </div>
      </motion.section>

      {/* 3. Photo Gallery (Bento) */}
      {!isSeniorMode && (
        <section className="relative py-20 px-6 bg-slate-50/50">
          <div className="max-w-md mx-auto">
            <h2 className={`${t.h2} mb-10 text-center`} style={{ fontFamily: 'Noto Serif KR, serif' }}>우리의 기록</h2>
            <div className="grid grid-cols-2 gap-3">
              <img src="https://picsum.photos/seed/wed2/400/600" alt="Gallery 1" className="rounded-2xl object-cover h-64 w-full" />
              <img src="https://picsum.photos/seed/wed3/400/400" alt="Gallery 2" className="rounded-2xl object-cover h-32 w-full mt-auto" />
              <img src="https://picsum.photos/seed/wed4/400/400" alt="Gallery 3" className="rounded-2xl object-cover h-32 w-full mb-auto" />
              <img src="https://picsum.photos/seed/wed5/400/600" alt="Gallery 4" className="rounded-2xl object-cover h-64 w-full" />
            </div>
          </div>
        </section>
      )}

      {/* 3-1. Our Story (커플 스토리 타임라인) */}
      {!isSeniorMode && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative py-20 px-6"
          style={{ background: theme.bgGradient }}
        >
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12">
              <div className="text-5xl mb-4 opacity-20">✿</div>
              <h2 className={`${t.h2} mb-3`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
                우리의 이야기
              </h2>
              <p className={`${t.body} opacity-70`}>함께 걸어온 소중한 순간들</p>
            </div>

            <div className="space-y-8">
              {/* 타임라인 아이템 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.gold }}>
                    <span className="text-white text-lg">💑</span>
                  </div>
                  <div className="w-0.5 h-full mt-2" style={{ backgroundColor: `${theme.gold}30` }}></div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <p className="text-sm font-semibold mb-1" style={{ color: theme.gold }}>2020년 봄</p>
                    <h4 className="font-bold text-slate-800 mb-2">첫 만남</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      운명처럼 마주친 우리의 첫 만남,<br />
                      서로의 눈빛에서 특별함을 느꼈습니다.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 타임라인 아이템 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.gold }}>
                    <span className="text-white text-lg">❤️</span>
                  </div>
                  <div className="w-0.5 h-full mt-2" style={{ backgroundColor: `${theme.gold}30` }}></div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <p className="text-sm font-semibold mb-1" style={{ color: theme.gold }}>2021년 여름</p>
                    <h4 className="font-bold text-slate-800 mb-2">공식적인 시작</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      서로를 향한 마음을 확인하고<br />
                      함께하는 시간이 점점 늘어갔습니다.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 타임라인 아이템 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.gold }}>
                    <span className="text-white text-lg">💍</span>
                  </div>
                  <div className="w-0.5 h-full mt-2" style={{ backgroundColor: `${theme.gold}30` }}></div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <p className="text-sm font-semibold mb-1" style={{ color: theme.gold }}>2025년 가을</p>
                    <h4 className="font-bold text-slate-800 mb-2">프러포즈</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      평생을 함께하고 싶다는 마음을 전했고,<br />
                      서로의 미래를 약속했습니다.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 타임라인 아이템 4 (결혼) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.primary }}>
                    <span className="text-white text-lg">🎉</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl p-5 shadow-md border-2" style={{
                    backgroundColor: theme.bgPastel2,
                    borderColor: theme.gold
                  }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: theme.gold }}>2026년 3월 28일</p>
                    <h4 className="font-bold text-slate-800 mb-2">결혼식</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      이제 우리는 부부가 됩니다.<br />
                      새로운 시작을 함께 축하해주세요.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* 4. D-Day Counter */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative py-20 px-6"
      >
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-2xl mb-2 opacity-30">✿</div>
            <h3 className="text-3xl mb-2" style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
              우리의 특별한 날까지
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-3xl p-6 shadow-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.bgPastel1} 0%, #FFFFFF 100%)`,
                border: `2px solid ${theme.gold}20`
              }}
            >
              <div className={`${isSeniorMode ? 'text-5xl' : 'text-4xl'} font-black mb-2`} style={{
                color: theme.gold,
                textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
              }}>
                {timeLeft.days}
              </div>
              <div className="text-xs tracking-wider font-semibold opacity-70">DAYS</div>
              <div className="absolute top-2 right-2 text-3xl opacity-10">✿</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-3xl p-6 shadow-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.bgPastel1} 0%, #FFFFFF 100%)`,
                border: `2px solid ${theme.gold}20`
              }}
            >
              <div className={`${isSeniorMode ? 'text-5xl' : 'text-4xl'} font-black mb-2`} style={{
                color: theme.gold,
                textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
              }}>
                {timeLeft.hours}
              </div>
              <div className="text-xs tracking-wider font-semibold opacity-70">HOURS</div>
              <div className="absolute top-2 right-2 text-3xl opacity-10">✿</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-3xl p-6 shadow-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.bgPastel1} 0%, #FFFFFF 100%)`,
                border: `2px solid ${theme.gold}20`
              }}
            >
              <div className={`${isSeniorMode ? 'text-5xl' : 'text-4xl'} font-black mb-2`} style={{
                color: theme.gold,
                textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
              }}>
                {timeLeft.minutes}
              </div>
              <div className="text-xs tracking-wider font-semibold opacity-70">MINS</div>
              <div className="absolute top-2 right-2 text-3xl opacity-10">✿</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-3xl p-6 shadow-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.bgPastel1} 0%, #FFFFFF 100%)`,
                border: `2px solid ${theme.gold}20`
              }}
            >
              <div className={`${isSeniorMode ? 'text-5xl' : 'text-4xl'} font-black mb-2`} style={{
                color: theme.gold,
                textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
              }}>
                {timeLeft.seconds}
              </div>
              <div className="text-xs tracking-wider font-semibold opacity-70">SECS</div>
              <div className="absolute top-2 right-2 text-3xl opacity-10">✿</div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 5. When & Where */}
      <section className="relative py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl p-8 shadow-sm border border-slate-100" style={{ backgroundColor: theme.bgSection }}>
            <div className="mb-8">
              <h3 className={`${t.h2} mb-2`} style={{ fontFamily: 'Noto Serif KR, serif' }}>언제</h3>
              <p className={t.body}>2026년 3월 28일 금요일</p>
              <p className={t.body + ' font-bold'} style={{ color: theme.primary }}>낮 12시</p>
            </div>
            <div>
              <h3 className={`${t.h2} mb-2`} style={{ fontFamily: 'Noto Serif KR, serif' }}>어디서</h3>
              <p className={t.body}>라스코스 웨딩홀 (6층)</p>
              <p className={`${t.body} text-sm opacity-70`}>부산광역시 수영구 광안해변로 263</p>
            </div>
            <div className="mt-8">
              <h3 className={`${t.h2} mb-2`} style={{ fontFamily: 'Noto Serif KR, serif' }}>식사</h3>
              <p className={t.body}>한정식 코스요리</p>
              <p className={`${t.body} text-sm opacity-70`}>식당: 반상 7F</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-1. 안내사항 */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative py-20 px-6 bg-slate-50/50"
      >
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className={`${t.h2} mb-3`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
              안내사항
            </h2>
            <p className={`${t.body} opacity-70 text-sm`}>편안한 참석을 위한 안내입니다</p>
          </div>

          <div className="space-y-4">
            {/* 연회 안내 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${theme.primary}20` }}>
                  <span className="text-lg">🎊</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">연회장 정보</h3>
                  <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• <strong>위치:</strong> 라스코스 웨딩홀 6층</li>
                    <li>• <strong>수용 인원:</strong> 50명 (스몰 웨딩)</li>
                    <li>• <strong>시간:</strong> 12:00 예식 시작 (11:30부터 입장 가능)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 식사 안내 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${theme.primary}20` }}>
                  <span className="text-lg">🍽️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">식사 안내</h3>
                  <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
                    <li>• <strong>메뉴:</strong> 한정식 코스요리</li>
                    <li>• <strong>식당:</strong> 반상 (7층)</li>
                    <li>• <strong>시간:</strong> 예식 직후 ~ 14:00</li>
                    <li>• <strong>특이사항:</strong> 알레르기가 있으신 분은 미리 말씀해주세요</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 드레스 코드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${theme.primary}20` }}>
                  <span className="text-lg">👔</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">드레스 코드</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    편안한 캐주얼 복장으로 오셔도 좋습니다.<br />
                    우리의 작은 축제를 함께 즐겨주세요.
                  </p>
                </div>
              </div>
            </div>

            {/* 코로나19 안내 */}
            <div className="rounded-2xl p-6 shadow-sm border-2" style={{
              backgroundColor: `${theme.bgPastel1}`,
              borderColor: `${theme.primary}30`
            }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: theme.primary }}>
                  <span className="text-lg text-white">❤️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">참석에 대하여</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    건강이 좋지 않으신 분은 무리하지 마시고,<br />
                    마음으로 축하해주셔도 감사합니다.<br />
                    여러분의 건강과 안전이 최우선입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 6. Transportation Guide (상세 정보) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative py-12 px-6 bg-slate-50/50"
      >
        <div className="max-w-md mx-auto">
          <h2 className={`${t.h2} mb-8 text-center`} style={{ fontFamily: 'Noto Serif KR, serif' }}>오시는 길</h2>

          {/* 지하철 */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V3z M8 21h8 M12 17v4" />
                </svg>
              </div>
              <h3 className={`${t.body} font-bold`}>지하철</h3>
            </div>
            <div className={`${t.body} text-sm space-y-3`}>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-700 mb-1" style={{ color: theme.primary }}>부산 2호선 광안역</p>
                <p className="text-slate-600">3번 출구 → 직진 350m (도보 5분)</p>
                <p className="text-xs text-slate-500 mt-2">
                  ※ 광안해변로 따라 해운대 방향으로 직진<br />
                  ※ 우측 라스코스 건물 6층
                </p>
              </div>
            </div>
          </div>

          {/* 버스 */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v10m8-10v10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className={`${t.body} font-bold`}>버스</h3>
            </div>
            <div className={`${t.body} text-sm space-y-2`}>
              <div>
                <p className="font-semibold text-slate-700">광안리해수욕장 정류장 하차</p>
                <div className="mt-2 space-y-1">
                  <p className="text-slate-600">
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold mr-1">일반</span>
                    22, 31, 39, 40, 42, 51
                  </p>
                  <p className="text-slate-600">
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold mr-1">좌석</span>
                    1001, 141
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 자동차 */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className={`${t.body} font-bold`}>자동차</h3>
            </div>
            <div className={`${t.body} text-sm space-y-3`}>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-700 mb-1">네비게이션 주소</p>
                <p className="text-slate-600 text-xs">부산광역시 수영구 광안해변로 263</p>
                <p className="text-slate-600 text-xs mt-1">(라스코스 웨딩홀)</p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="font-semibold text-slate-700 mb-2">주차 안내</p>
                <ul className="space-y-1 text-slate-600 text-xs">
                  <li>• 건물 내 주차장 이용 가능</li>
                  <li>• 3시간 무료 주차권 제공</li>
                  <li>• 발레파킹 서비스 운영</li>
                </ul>
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-red-600 text-xs font-semibold">
                    ⚠️ 주차 공간이 협소하니 대중교통 이용을 권장합니다
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 셔틀버스 (결혼식 당일 운행) */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 shadow-sm border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.gold }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`${t.body} font-bold`} style={{ color: theme.gold }}>셔틀버스 (당일 운행)</h3>
            </div>
            <div className={`${t.body} text-sm space-y-3`}>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="font-semibold text-slate-700 mb-2">운행 일정</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">서면역 → 웨딩홀</span>
                    <span className="font-semibold" style={{ color: theme.primary }}>11:00, 11:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">웨딩홀 → 서면역</span>
                    <span className="font-semibold" style={{ color: theme.primary }}>13:30, 14:00</span>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-xs">
                  <strong>승차 위치:</strong> 서면역 7번 출구 앞<br />
                  <strong>소요 시간:</strong> 약 25분<br />
                  <strong>문의:</strong> 신랑 010-XXXX-XXXX
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 7. Map Link */}
      <section className="relative py-0 px-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-inner bg-slate-200 aspect-video flex items-center justify-center relative">
            <img src="https://picsum.photos/seed/map/800/450" alt="Map" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <a href={`https://map.naver.com/v5/search/${encodeURIComponent('부산광역시 수영구 광안해변로 263')}`} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                네이버 지도 열기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Guest Photo Upload */}
      {!isSeniorMode && (
        <section className="relative py-20 px-6">
          <div className="max-w-md mx-auto">
            <h2 className={`${t.h2} mb-4 text-center`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
              우리의 순간을 공유해주세요
            </h2>
            <p className={`${t.body} text-center mb-8 opacity-70`}>
              함께한 소중한 순간을 사진으로 남겨주세요
            </p>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <label className={`cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                  />
                  <div className="px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95" style={{ backgroundColor: theme.primary, color: 'white' }}>
                    {isUploading ? '업로드 중...' : '사진 선택하기'}
                  </div>
                </label>
                <p className="text-xs text-slate-400 mt-2">
                  최대 10MB, JPG/PNG 형식
                </p>
              </div>

              {/* 업로드된 사진 갤러리 */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-600 mb-4">
                  공유된 사진 ({photos.length})
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {photos.length === 0 ? (
                    <div className="col-span-3 aspect-square rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="text-xs text-slate-400">사진이 곧 공유됩니다</span>
                    </div>
                  ) : (
                    photos.map((photo) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square rounded-lg overflow-hidden bg-slate-100"
                      >
                        <img
                          src={photo.file_url}
                          alt="Guest photo"
                          className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                          onClick={() => window.open(photo.file_url, '_blank')}
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. Guestbook */}
      {!isSeniorMode && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative py-20 px-6"
        >
          <div className="max-w-md mx-auto">
            <h2 className={`${t.h2} mb-8 text-center`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
              방명록
            </h2>
            <p className={`${t.body} text-center mb-8 opacity-70`}>
              축하 메시지를 남겨주세요
            </p>

            {/* 방명록 작성 폼 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
              <div className="space-y-4">
                <input
                  type="text"
                  value={guestbookForm.name}
                  onChange={(e) => setGuestbookForm({ ...guestbookForm, name: e.target.value })}
                  placeholder="이름"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <textarea
                  value={guestbookForm.message}
                  onChange={(e) => setGuestbookForm({ ...guestbookForm, message: e.target.value })}
                  placeholder="축하 메시지를 입력해주세요"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
                <input
                  type="password"
                  value={guestbookForm.password}
                  onChange={(e) => setGuestbookForm({ ...guestbookForm, password: e.target.value })}
                  placeholder="비밀번호 (4자리 이상, 삭제 시 필요)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  onClick={handleSubmitGuestbook}
                  className="w-full py-3 rounded-xl text-white font-bold shadow-lg active:scale-95 transition-transform"
                  style={{ backgroundColor: theme.primary }}
                >
                  등록하기
                </button>
              </div>
            </div>

            {/* 방명록 목록 */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {guestbook.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-400">첫 번째 축하 메시지를 남겨주세요!</p>
                </div>
              ) : (
                guestbook.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm" style={{ color: theme.primary }}>
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {new Date(entry.created_at!).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <button
                          onClick={() => handleDeleteGuestbook(entry.id!)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {entry.message}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* 10. Account Info */}
      <section className="relative py-20 px-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 text-2xl">🎁</div>
            <h2 className={`${t.h2} mb-4 font-bold`}>따뜻한 마음을 담아 오세요</h2>
            <p className={`${t.body} mb-6 text-slate-600`}>
              현장에서는 편하게<br />
              즐기시기만 하면 됩니다.
            </p>
            <button onClick={() => setIsAccountOpen(!isAccountOpen)} className="text-sm font-medium underline underline-offset-4 opacity-50 hover:opacity-100 transition-opacity">
              {isAccountOpen ? '계좌번호 닫기' : '마음을 전하는 곳'}
            </button>
            <AnimatePresence>
              {isAccountOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 space-y-3">
                  <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <span className="text-xs font-bold text-slate-400">신랑 유기웅</span>
                    <span className="font-mono text-sm">국민 331302-04-156931</span>
                    <button onClick={() => copyToClipboard('331302-04-156931', '신랑')} className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">복사</button>
                  </div>
                  <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <span className="text-xs font-bold text-slate-400">신랑 모 김옥순</span>
                    <span className="font-mono text-sm">전북 528-22-0389545</span>
                    <button onClick={() => copyToClipboard('528-22-0389545', '신랑 모')} className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">복사</button>
                  </div>
                  <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <span className="text-xs font-bold text-slate-400">신부 서겨울</span>
                    <span className="font-mono text-sm">농협 302-1697-1560-21</span>
                    <button onClick={() => copyToClipboard('302-1697-1560-21', '신부')} className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">복사</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 11. Share & RSVP */}
      <section className="relative py-20 px-6 mb-20">
        <div className="max-w-md mx-auto text-center">
          {/* 공유 버튼 */}
          <div className="mb-12">
            <p className={`${t.body} mb-4 opacity-60`}>소중한 분들께 공유해주세요</p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all border-2"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              초대장 공유하기
            </button>
          </div>

          {/* RSVP */}
          <h2 className={`${t.h2} mb-4`} style={{ fontFamily: 'Noto Serif KR, serif' }}>RSVP</h2>
          <p className={`${t.body} mb-8 opacity-60 text-sm`}>참석 인원 파악을 위해 3월 14일까지 알려주세요.</p>
          <button onClick={() => setIsRsvpOpen(true)} className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 transition-transform" style={{ backgroundColor: theme.primary }}>
            참석 여부 전달하기
          </button>
        </div>
        <footer className="mt-20 text-center opacity-30 text-xs tracking-widest pb-10">
          &copy; 2026 KIWUNG & GYEOUL. DESIGNED FOR OUR SMALL FESTIVAL.
        </footer>
      </section>

      {/* RSVP Modal */}
      <AnimatePresence>
        {isRsvpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setIsRsvpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
                  참석 여부
                </h3>
                <button
                  onClick={() => setIsRsvpOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                {/* 참석 여부 */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700">참석 여부</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, attending: 'yes' })}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        formData.attending === 'yes'
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      참석합니다
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, attending: 'no' })}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        formData.attending === 'no'
                          ? 'bg-slate-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      불참합니다
                    </button>
                  </div>
                </div>

                {/* 인원 수 (참석할 때만) */}
                {formData.attending === 'yes' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700">성인 인원</label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setFormData({ ...formData, guest_count: Math.max(1, formData.guest_count - 1) })}
                          className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.guest_count}</span>
                        <button
                          onClick={() => setFormData({ ...formData, guest_count: Math.min(10, formData.guest_count + 1) })}
                          className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                        >
                          +
                        </button>
                        <span className="text-sm text-slate-500 ml-2">명</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700">소인 (어린이) 인원</label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setFormData({ ...formData, child_count: Math.max(0, formData.child_count - 1) })}
                          className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.child_count}</span>
                        <button
                          onClick={() => setFormData({ ...formData, child_count: Math.min(10, formData.child_count + 1) })}
                          className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-lg"
                        >
                          +
                        </button>
                        <span className="text-sm text-slate-500 ml-2">명</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 메시지 */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">축하 메시지 (선택)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="축하 메시지를 남겨주세요"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* 제출 버튼 */}
                <button
                  onClick={handleSubmitRSVP}
                  className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl active:scale-95 transition-transform"
                  style={{ backgroundColor: theme.primary }}
                >
                  제출하기
                </button>

                {/* 오늘 하루 보지 않기 */}
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setHours(24, 0, 0, 0); // 다음 날 자정
                    localStorage.setItem('hideRsvpUntil', tomorrow.getTime().toString());
                    setIsRsvpOpen(false);
                  }}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  오늘 하루 보지 않기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
