'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  saveRSVP,
  saveGuestbook,
  getGuestbook,
  subscribeToGuestbook,
  deleteGuestbook,
  type GuestbookEntry
} from './lib/supabase';

// 타자기 효과 인트로 컴포넌트
function IntroScreen({ onClose, onStartMusic }: { onClose: () => void; onStartMusic: () => void }) {
  const [displayText, setDisplayText] = useState('');
  const [showSubText, setShowSubText] = useState(false);

  const fullText = '기웅 & 겨울';

  // 타자 소리 재생 (Web Audio API) - 감성적인 피아노 톤
  const playTypeSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 메인 톤 (피아노 느낌)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // 서브 톤 (하모닉스)
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator.connect(gainNode);
      oscillator2.connect(gainNode2);
      gainNode.connect(audioContext.destination);
      gainNode2.connect(audioContext.destination);

      // 랜덤 피아노 음계 (C5, D5, E5, G5, A5 - 펜타토닉)
      const notes = [523, 587, 659, 784, 880];
      const freq = notes[Math.floor(Math.random() * notes.length)];

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine';

      oscillator2.frequency.setValueAtTime(freq * 2, audioContext.currentTime);
      oscillator2.type = 'sine';

      // 부드러운 어택과 디케이
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.2);
    } catch (e) {}
  };

  // 자동으로 타이핑 시작 (마운트 시)
  useEffect(() => {
    // 약간의 딜레이 후 타이핑 시작
    const startDelay = setTimeout(() => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setDisplayText(fullText.slice(0, charIndex + 1));
          playTypeSound();
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setShowSubText(true), 300);
          // 타이핑 완료 후 2초 뒤 자동으로 닫기
          setTimeout(() => onClose(), 2000);
        }
      }, 180);
    }, 800); // 화면 표시 후 0.8초 뒤 타이핑 시작

    return () => clearTimeout(startDelay);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900"
      onClick={onStartMusic}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center text-white px-6"
      >
        {/* 상단 영문 - 필기체 */}
        <p className="text-2xl md:text-3xl mb-8 opacity-60 font-[var(--font-great-vibes)] tracking-wide">
          Our Wedding Day
        </p>

        {/* 타자기 효과 텍스트 */}
        <h1 className="mb-6 min-h-[5rem] flex items-center justify-center">
          {displayText.split(' & ').map((part, idx) => (
            <span key={idx} className="inline-flex items-center">
              {idx > 0 && (
                <span className="text-3xl md:text-4xl opacity-40 mx-4 font-[var(--font-great-vibes)]">
                  &
                </span>
              )}
              <span className="text-4xl md:text-5xl tracking-[0.15em] font-light font-[var(--font-noto-serif-kr)]">
                {part.replace(' & ', '')}
              </span>
            </span>
          ))}
          <span className="animate-pulse ml-1 text-4xl md:text-5xl font-thin opacity-60">|</span>
        </h1>

        {/* 장식 라인 */}
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/60" />
          <span className="text-xs tracking-[0.5em]">WEDDING</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/60" />
        </div>

        {/* 날짜 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showSubText ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <p className="text-sm tracking-[0.4em] opacity-70 font-light">
            2026. 03. 28
          </p>
          <p className="text-xs tracking-[0.3em] opacity-50">
            SATURDAY PM 12:00
          </p>
        </motion.div>

        {/* 스크롤 힌트 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showSubText ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-14"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-xs tracking-[0.3em] opacity-25"
          >
            SCROLL
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// 클래식 베이지 테마 (고급스러운 웨딩 감성)
const theme = {
  primary: '#C9A66B',      // 따뜻한 탄 (Warm Tan)
  secondary: '#F5F5DC',    // Beige
  gold: '#D4AF37',         // 골드 악센트
  button: '#B8956A',       // 브론즈 베이지 (Button)
  bgMain: '#FAF9F6',       // Off-white
  bgSection: '#FFFFFF',    // White
  bgPastel1: '#F5EFE6',    // 연한 베이지
  bgPastel2: '#FFF9F0',    // 크림
  bgGradient: 'linear-gradient(135deg, #F5EFE6 0%, #FFF9F0 100%)',
  textMain: '#2D3436',     // Dark Gray
  textMuted: '#636E72',    // Medium Gray
};

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // 인트로 클릭 시 재생 시작
  const [isSeniorMode, setIsSeniorMode] = useState(false);
  const [showSeniorButton, setShowSeniorButton] = useState(true); // 크게보기 버튼 표시 여부
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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [guestbookForm, setGuestbookForm] = useState({ name: '', message: '', password: '' });
  const [isParkingImageOpen, setIsParkingImageOpen] = useState(false);

  // 음악 시작 함수 (인트로 클릭 시 호출)
  const startMusic = () => {
    const audio = document.getElementById('bgm-audio') as HTMLAudioElement;
    if (audio && !isMusicPlaying) {
      audio.currentTime = 2; // 2초부터 시작
      audio.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {
        // 자동재생 차단됨 - 사용자 인터랙션 대기
      });
    }
  };

  // 화면 어디든 터치/클릭하면 음악 시작 (vividvows 방식)
  useEffect(() => {
    const handleFirstInteraction = () => {
      startMusic();
    };

    // 터치와 클릭 모두 감지
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [isMusicPlaying]);

  // 인트로 화면 - 타이핑 완료 후 자동 닫힘 (startTyping에서 처리)

  // 크게보기 버튼 스크롤 시 숨기기
  useEffect(() => {
    const handleScroll = () => {
      // 화면 높이의 50% 이상 스크롤하면 버튼 숨기기
      const scrollThreshold = window.innerHeight * 0.5;
      setShowSeniorButton(window.scrollY < scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // 스크롤 자동 팝업 (날짜/장소 확인 직후)
  useEffect(() => {
    const handleScroll = () => {
      // 이미 팝업을 표시했거나, 모달이 이미 열려있으면 무시
      if (hasShownAutoPopup || isRsvpOpen) return;

      // localStorage 체크: "오늘 하루 보지 않기" 확인
      const hideUntil = localStorage.getItem('hideRsvpUntil');
      if (hideUntil && new Date().getTime() < parseInt(hideUntil)) {
        return;
      }

      // 페이지 스크롤 45% 체크 (날짜/장소 확인 후)
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercentage > 45) {
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

  const toggleMusic = () => {
    const audio = document.getElementById('bgm-audio') as HTMLAudioElement;
    if (audio) {
      if (isMusicPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
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
      setFormData({ name: '', attending: 'yes', guest_count: 1, child_count: 0, message: '' });
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
    h2: 'text-xl md:text-2xl font-extrabold tracking-tight',
    body: 'text-base',
  };

  return (
    <main className="min-h-screen transition-colors duration-500" style={{ background: theme.bgGradient, color: theme.textMain }}>
      {/* 인트로 화면 - 타자기 효과 */}
      <AnimatePresence>
        {showIntro && (
          <IntroScreen onClose={() => setShowIntro(false)} onStartMusic={startMusic} />
        )}
      </AnimatePresence>

      {/* 배경 음악 */}
      <audio id="bgm-audio" loop preload="auto">
        <source src="/music/bgm.mp4" type="audio/mp4" />
      </audio>

      {/* 음악 재생/정지 버튼 (크기 축소) */}
      <button
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all"
        style={{ backgroundColor: isMusicPlaying ? theme.primary : 'white' }}
      >
        {isMusicPlaying ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: theme.primary }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      {/* 크게보기 토글 - 스크롤 시 숨김 */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 1, scale: 1 }}
        animate={{
          opacity: showSeniorButton ? 1 : 0,
          scale: showSeniorButton ? 1 : 0,
          y: showSeniorButton ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => setIsSeniorMode(!isSeniorMode)}
          className={`shadow-xl px-5 py-3 rounded-full font-bold text-sm transition-all transform active:scale-95 ${
            isSeniorMode ? 'bg-slate-900 text-white scale-110' : 'bg-white text-slate-900 border-2 border-slate-200'
          }`}
        >
          {isSeniorMode ? '크게보기 ON' : '크게보기 OFF'}
        </button>
      </motion.div>

      {/* 1. Hero Section - Our Wedding Day 스타일 */}
      <section
        className="min-h-[65vh] md:min-h-screen relative flex flex-col items-center justify-center text-center px-6 py-4 md:py-16 overflow-hidden"
        style={{ backgroundColor: theme.bgPastel2 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-lg mx-auto"
        >
          {/* 상단 텍스트 */}
          <p
            className="text-xs tracking-[0.4em] mb-6 uppercase font-[var(--font-noto-serif-kr)]"
            style={{ color: theme.textMuted }}
          >
            Our Wedding Day
          </p>

          {/* 메인 웨딩 사진 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative mb-8"
          >
            {/* 사진 프레임 */}
            <div className="relative mx-auto overflow-hidden rounded-lg shadow-2xl" style={{ maxWidth: '380px' }}>
              <img
                src="/pic/청첩장.jpg"
                alt="기웅 & 겨울 웨딩 사진"
                className="w-full h-auto object-cover"
                style={{ aspectRatio: '3/4' }}
              />
              {/* 사진 테두리 효과 */}
              <div className="absolute inset-0 border-4 border-white/20 rounded-lg pointer-events-none" />
            </div>
          </motion.div>

          {/* 신랑신부 이름 */}
          <div className="mb-6">
            <h1
              className="text-3xl md:text-4xl font-light tracking-wider mb-3 font-[var(--font-noto-serif-kr)]"
              style={{ color: theme.textMain }}
            >
              기웅 <span className="text-2xl md:text-3xl opacity-50 mx-2">&</span> 겨울
            </h1>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px w-12" style={{ backgroundColor: theme.primary, opacity: 0.4 }}></div>
              <span className="text-lg" style={{ color: theme.gold, opacity: 0.7 }}>✿</span>
              <div className="h-px w-12" style={{ backgroundColor: theme.primary, opacity: 0.4 }}></div>
            </div>
          </div>

          {/* 날짜 및 장소 */}
          <div className="space-y-1">
            <p
              className={`${t.body} tracking-wider font-[var(--font-noto-serif-kr)]`}
              style={{ color: theme.textMain }}
            >
              2026. 03. 28. FRI PM 12:00
            </p>
            <p
              className={`${t.body} font-[var(--font-noto-serif-kr)]`}
              style={{ color: theme.textMuted }}
            >
              라스코스 웨딩홀
            </p>
          </div>

          {/* 하단 안내 문구 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-10 text-xs tracking-wide font-[var(--font-noto-serif-kr)]"
            style={{ color: theme.textMuted, opacity: 0.6 }}
          >
            두 사람의 마음을 담아 직접 만든 초대장입니다
          </motion.p>
        </motion.div>

        {/* 스크롤 힌트 - 텍스트와 겹치지 않게 위치 조정 */}
        <motion.div
          className="absolute bottom-12 md:bottom-8 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ color: theme.textMuted }}
        >
          <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* 2. Invitation Message */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
        className="relative py-24 px-6"
        style={{ backgroundColor: theme.bgPastel2 }}
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

          <div className="mt-16 space-y-3 py-8 px-6 bg-white/60 backdrop-blur rounded-xl">
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

      {/* 3-1. Our Story (커플 스토리 타임라인) */}
      {!isSeniorMode && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative py-20 px-6"
          style={{ backgroundColor: theme.bgPastel1 }}
        >
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12">
              <div className="text-5xl mb-4 opacity-20">✿</div>
              <p className="text-center text-sm tracking-widest mb-2 font-great-vibes" style={{ color: theme.primary }}>Our Story</p>
              <h2 className={`${t.h2} mb-3`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
                우리의 이야기
              </h2>
              <p className={`${t.body} opacity-70`}>함께 걸어온 소중한 순간들</p>
            </div>

            {/* 중앙 타임라인 레이아웃 */}
            <div className="relative">
              {/* 중앙 세로선 */}
              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full"
                style={{ backgroundColor: `${theme.gold}40` }}
              />

              {/* 타임라인 아이템 1: 사진 왼쪽, 텍스트 오른쪽 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative flex items-center mb-16"
              >
                {/* 왼쪽: 사진 */}
                <div className="w-[46%] pr-2 flex justify-end">
                  <img
                    src="/pic/1.jpg"
                    alt="첫 만남"
                    className="w-28 h-32 rounded-lg shadow-lg object-cover"
                  />
                </div>
                {/* 중앙: 점 */}
                <div className="w-[8%] flex justify-center">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: theme.gold }} />
                </div>
                {/* 오른쪽: 텍스트 */}
                <div className="w-[46%] pl-2">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs text-white mb-2"
                    style={{ backgroundColor: theme.gold }}
                  >
                    2023년 6월 18일
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">첫 만남</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    책을 통해 만난 두 사람<br/>
                    서로에게 마음이 닿은 날
                  </p>
                </div>
              </motion.div>

              {/* 타임라인 아이템 2: 텍스트 왼쪽, 사진 오른쪽 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative flex items-center mb-16"
              >
                {/* 왼쪽: 텍스트 */}
                <div className="w-[46%] pr-2 text-right">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs text-white mb-2"
                    style={{ backgroundColor: theme.gold }}
                  >
                    연애 시작
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">함께 걸어온 시간</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    첫 만남 후 5일 만에<br/>
                    서로 통한 마음
                  </p>
                </div>
                {/* 중앙: 점 */}
                <div className="w-[8%] flex justify-center">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: theme.gold }} />
                </div>
                {/* 오른쪽: 사진 */}
                <div className="w-[46%] pl-2">
                  <img
                    src="/pic/3.jpg"
                    alt="함께한 시간"
                    className="w-28 h-32 rounded-lg shadow-lg object-cover"
                  />
                </div>
              </motion.div>

              {/* 타임라인 아이템 3: 사진 왼쪽, 텍스트 오른쪽 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative flex items-center mb-16"
              >
                {/* 왼쪽: 사진 */}
                <div className="w-[46%] pr-2 flex justify-end">
                  <img
                    src="/pic/4.jpg"
                    alt="함께하기로"
                    className="w-28 h-32 rounded-lg shadow-lg object-cover"
                  />
                </div>
                {/* 중앙: 점 */}
                <div className="w-[8%] flex justify-center">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: theme.gold }} />
                </div>
                {/* 오른쪽: 텍스트 */}
                <div className="w-[46%] pl-2">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs text-white mb-2"
                    style={{ backgroundColor: theme.gold }}
                  >
                    2025년 여름
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">함께하기로 했다</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    서로 함께하겠다는<br/>
                    마음을 확인
                  </p>
                </div>
              </motion.div>

              {/* 타임라인 아이템 4: 텍스트 왼쪽, 사진 오른쪽 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative flex items-center"
              >
                {/* 왼쪽: 텍스트 */}
                <div className="w-[46%] pr-2 text-right">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs text-white mb-2"
                    style={{ backgroundColor: theme.primary }}
                  >
                    2026년 3월 28일
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">결혼식</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    새로운 시작을 함께<br/>
                    축하해주세요
                  </p>
                </div>
                {/* 중앙: 점 */}
                <div className="w-[8%] flex justify-center">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: theme.primary }} />
                </div>
                {/* 오른쪽: 사진 */}
                <div className="w-[46%] pl-2">
                  <img
                    src="/pic/5.jpg"
                    alt="결혼식"
                    className="w-28 h-32 rounded-lg shadow-lg object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* 4. Wedding Day Calendar */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative py-16 px-6"
        style={{ backgroundColor: theme.bgPastel1 }}
      >
        <div className="max-w-sm mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <p className="text-sm tracking-widest mb-2 font-great-vibes" style={{ color: theme.primary }}>Wedding Day</p>
            <h3 className="text-lg" style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
              2026. 03. 28. 토요일 낮 12시
            </h3>
          </div>

          {/* 달력 */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h4 className="text-center text-lg font-semibold mb-4" style={{ color: theme.primary }}>3월</h4>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 text-center text-xs font-medium mb-2">
              <span className="text-red-400">일</span>
              <span className="text-slate-500">월</span>
              <span className="text-slate-500">화</span>
              <span className="text-slate-500">수</span>
              <span className="text-slate-500">목</span>
              <span className="text-slate-500">금</span>
              <span className="text-blue-400">토</span>
            </div>

            {/* 날짜 그리드 - 2026년 3월 */}
            <div className="grid grid-cols-7 text-center text-sm gap-y-1">
              {/* 1주차: 3월 1일은 일요일 */}
              <span className="py-2 text-red-400">1</span>
              <span className="py-2">2</span>
              <span className="py-2">3</span>
              <span className="py-2">4</span>
              <span className="py-2">5</span>
              <span className="py-2">6</span>
              <span className="py-2 text-blue-400">7</span>

              {/* 2주차 */}
              <span className="py-2 text-red-400">8</span>
              <span className="py-2">9</span>
              <span className="py-2">10</span>
              <span className="py-2">11</span>
              <span className="py-2">12</span>
              <span className="py-2">13</span>
              <span className="py-2 text-blue-400">14</span>

              {/* 3주차 */}
              <span className="py-2 text-red-400">15</span>
              <span className="py-2">16</span>
              <span className="py-2">17</span>
              <span className="py-2">18</span>
              <span className="py-2">19</span>
              <span className="py-2">20</span>
              <span className="py-2 text-blue-400">21</span>

              {/* 4주차 */}
              <span className="py-2 text-red-400">22</span>
              <span className="py-2">23</span>
              <span className="py-2">24</span>
              <span className="py-2">25</span>
              <span className="py-2">26</span>
              <span className="py-2">27</span>
              {/* 28일 - 결혼식 */}
              <span
                className="py-2 rounded-full text-white font-bold"
                style={{ backgroundColor: theme.primary }}
              >28</span>

              {/* 5주차 */}
              <span className="py-2 text-red-400">29</span>
              <span className="py-2">30</span>
              <span className="py-2">31</span>
              <span className="py-2"></span>
              <span className="py-2"></span>
              <span className="py-2"></span>
              <span className="py-2"></span>
            </div>
          </div>

          {/* 카운트다운 */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm text-center min-w-[60px]">
              <div className="text-lg font-bold" style={{ color: theme.primary }}>{timeLeft.days}</div>
              <div className="text-[10px] text-slate-400">DAYS</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm text-center min-w-[60px]">
              <div className="text-lg font-bold" style={{ color: theme.primary }}>{timeLeft.hours}</div>
              <div className="text-[10px] text-slate-400">HOUR</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm text-center min-w-[60px]">
              <div className="text-lg font-bold" style={{ color: theme.primary }}>{timeLeft.minutes}</div>
              <div className="text-[10px] text-slate-400">MIN</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm text-center min-w-[60px]">
              <div className="text-lg font-bold" style={{ color: theme.primary }}>{timeLeft.seconds}</div>
              <div className="text-[10px] text-slate-400">SEC</div>
            </div>
          </div>

          {/* 메시지 */}
          <p className="text-center text-sm text-slate-600 break-keep">
            기웅 <span style={{ color: theme.primary }}>&#10084;</span> 겨울의 결혼식이 <span className="font-bold" style={{ color: theme.primary }}>{timeLeft.days}일</span> 남았습니다.
          </p>
        </div>
      </motion.section>

      {/* 5. When & Where */}
      <section className="relative py-20 px-6">
        <div className="max-w-md mx-auto">
          <p className="text-center text-sm tracking-widest mb-6 font-great-vibes" style={{ color: theme.primary }}>When & Where</p>
          <div className="rounded-xl p-8 shadow-sm border border-slate-100" style={{ backgroundColor: theme.bgSection }}>
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

      {/* 5-1. Account Info (마음 전하는 곳) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative py-20 px-6"
      >
        <div className="max-w-md mx-auto">
          {/* 영문 제목 */}
          <p className="text-center text-sm tracking-widest mb-2 font-great-vibes" style={{ color: theme.primary }}>With Love</p>
          <h2 className={`${t.h2} mb-6 text-center`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
            마음 전하는 곳
          </h2>

          {/* 스몰웨딩 안내 문구 */}
          <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: `${theme.gold}10`, border: `1px solid ${theme.gold}30` }}>
            <p className="text-center text-sm text-slate-700 leading-loose">
              저희 두 사람은 소중한 분들과 함께<br />
              <span className="font-semibold" style={{ color: theme.primary }}>작지만 따뜻한 결혼식</span>을<br />
              정성껏 준비하고 있습니다.
            </p>
            <p className="text-center text-sm text-slate-600 leading-loose mt-4">
              부담 없이 오셔서<br />
              함께 축하해 주시는 것만으로<br />
              저희에게는 가장 큰 선물입니다.
            </p>
            <p className="text-center text-sm leading-loose mt-4 py-3 px-4 rounded-lg" style={{ backgroundColor: `${theme.primary}15` }}>
              <span className="font-semibold" style={{ color: theme.primary }}>현장에서 축의금을 따로 받지 않습니다</span><br />
              <span className="text-slate-600">마음을 전해주고 싶으신 분들은<br />
              아래 계좌로 전달해 주시면<br />
              감사히 받겠습니다.</span>
            </p>
          </div>

          <div className="space-y-3">
            {/* 신랑측 계좌번호 */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-800">신랑측 계좌번호</span>
                <svg
                  className={`w-5 h-5 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-3 border-t border-slate-100">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">신랑</span>
                          <span className="text-sm font-semibold">유기웅</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm">국민 331302-04-156931</span>
                          <button
                            onClick={() => copyToClipboard('331302-04-156931', '신랑')}
                            className="text-xs px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                            style={{ backgroundColor: theme.button, color: 'white' }}
                          >
                            복사
                          </button>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">신랑 모</span>
                          <span className="text-sm font-semibold">김옥순</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm">전북 528-22-0389545</span>
                          <button
                            onClick={() => copyToClipboard('528-22-0389545', '신랑 모')}
                            className="text-xs px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                            style={{ backgroundColor: theme.button, color: 'white' }}
                          >
                            복사
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 신부측 계좌번호 */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-800">신부측 계좌번호</span>
                <svg
                  className={`w-5 h-5 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-3 border-t border-slate-100">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">신부</span>
                          <span className="text-sm font-semibold">서겨울</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm">BNK부산은행 1122312671607</span>
                          <button
                            onClick={() => copyToClipboard('1122312671607', '신부')}
                            className="text-xs px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                            style={{ backgroundColor: theme.button, color: 'white' }}
                          >
                            복사
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 6. 오시는 길 (지도 먼저) */}
      <section className="relative py-12 px-6">
        <div className="max-w-md mx-auto">
          <p className="text-center text-sm tracking-widest mb-2 font-great-vibes" style={{ color: theme.primary }}>Location</p>
          <h2 className={`${t.h2} mb-8 text-center`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>오시는 길</h2>

          {/* 지도 */}
          <div className="rounded-xl overflow-hidden shadow-lg bg-slate-200 aspect-video flex items-center justify-center relative mb-8">
            <img src="/pic/웨딩홀.jpg" alt="라스코스 웨딩홀" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <a href={`https://map.naver.com/v5/search/${encodeURIComponent('부산광역시 수영구 광안해변로 263')}`} target="_blank" rel="noopener noreferrer" className="bg-white/90 backdrop-blur px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                네이버 지도 열기
              </a>
            </div>
          </div>

          {/* 지하철 */}
          <div className="bg-white rounded-lg p-6 mb-4 shadow-sm border border-slate-100">
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
                <p className="text-slate-600">3번 출구 → 광안리해수욕장 방향 도보 15분</p>
                <p className="text-xs text-slate-500 mt-2">
                  ※ 광안해변로 따라 민락동 방향 직진<br />
                  ※ 라스코스 건물 6층
                </p>
              </div>
            </div>
          </div>

          {/* 버스 */}
          <div className="bg-white rounded-lg p-6 mb-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v10m8-10v10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className={`${t.body} font-bold`}>버스</h3>
            </div>
            <div className={`${t.body} text-sm space-y-3`}>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-700 mb-1">광안리해수욕장 정류장</p>
                <p className="text-xs text-slate-500 mb-2">하차 후 도보 6분</p>
                <p className="text-xs text-blue-600">41, 62, 83, 83-1, 38, 108번</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-700 mb-1">광안농협앞 정류장</p>
                <p className="text-xs text-slate-500 mb-2">반대편 정류장 · 하차 후 도보 6분</p>
                <p className="text-xs text-blue-600">49, 41, 38, 62, 83, 83-1, 108번</p>
              </div>
            </div>
          </div>

          {/* 자동차 */}
          <div className="bg-white rounded-lg p-6 mb-4 shadow-sm border border-slate-100">
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
                <ul className="space-y-1 text-slate-600 text-xs mb-3">
                  <li>• 건물 내 주차장 이용 가능</li>
                  <li>• 무료 주차 가능</li>
                </ul>
                <div className="mt-3">
                  <button
                    onClick={() => setIsParkingImageOpen(!isParkingImageOpen)}
                    className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-all hover:opacity-90 shadow-md"
                    style={{ backgroundColor: theme.primary }}
                  >
                    주차장 입구 확인하기
                  </button>
                  {isParkingImageOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <img src="/pic/parking.jpg" alt="주차장 입구" className="w-full rounded-lg border border-slate-200" />
                      <p className="text-xs text-slate-500 mt-1 text-center">주차장 입구</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7-1. 안내사항 */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative py-20 px-6 bg-slate-50/50"
      >
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-center text-sm tracking-widest mb-2 font-great-vibes" style={{ color: theme.primary }}>Information</p>
            <h2 className={`${t.h2} mb-3`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
              안내사항
            </h2>
            <p className={`${t.body} opacity-70 text-sm`}>편안한 참석을 위한 안내입니다</p>
          </div>

          <div className="space-y-4">
            {/* 연회 안내 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${theme.primary}20` }}>
                  <span className="text-lg">❀</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">연회장 정보</h3>
                  <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed break-keep">
                    <li>• <strong>위치:</strong> 6층 연회장</li>
                    <li>• <strong>인원:</strong> 50명 (스몰웨딩)</li>
                    <li>• <strong>시간:</strong> 12:00 시작<br /><span className="ml-12 text-xs opacity-70">11:30부터 입장</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 식사 안내 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${theme.primary}20` }}>
                  <span className="text-lg">✿</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">식사 안내</h3>
                  <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed break-keep">
                    <li>• <strong>메뉴:</strong> 한정식 코스요리</li>
                    <li>• <strong>식당:</strong> 반상 (7층)</li>
                    <li>• <strong>시간:</strong> 예식 후 ~ 14:00</li>
                    <li>• <strong>알레르기:</strong> 미리 말씀해주세요</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 드레스 코드 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${theme.primary}20` }}>
                  <span className="text-lg">❁</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">드레스 코드</h3>
                  <p className="text-sm text-slate-600 leading-relaxed break-keep">
                    편안한 복장으로 오셔도 좋습니다.<br />
                    작은 축제를 함께 즐겨주세요.
                  </p>
                </div>
              </div>
            </div>

            {/* 참석 안내 */}
            <div className="rounded-lg p-6 shadow-sm border-2" style={{
              backgroundColor: `${theme.bgPastel1}`,
              borderColor: `${theme.primary}30`
            }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: theme.primary }}>
                  <span className="text-lg text-white">✻</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-2">참석에 대하여</h3>
                  <p className="text-sm text-slate-600 leading-relaxed break-keep">
                    건강이 좋지 않으신 분은<br />
                    무리하지 마세요.<br />
                    마음으로 축하해주셔도 감사합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 연락처 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 text-center">문의하기</h3>
              <div className="space-y-3">
                <a href="tel:010-4848-5400" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-xs text-slate-500">신랑</p>
                    <p className="font-semibold text-slate-800">기웅</p>
                  </div>
                  <p className="font-mono text-sm" style={{ color: theme.primary }}>010-4848-5400</p>
                </a>
                <a href="tel:010-9485-0071" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-xs text-slate-500">신부</p>
                    <p className="font-semibold text-slate-800">겨울</p>
                  </div>
                  <p className="font-mono text-sm" style={{ color: theme.primary }}>010-9485-0071</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

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
            <p className="text-center text-sm tracking-widest mb-2 font-great-vibes" style={{ color: theme.primary }}>Guestbook</p>
            <h2 className={`${t.h2} mb-4 text-center`} style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
              방명록
            </h2>
            <p className={`${t.body} text-center mb-8 opacity-70`}>
              축하 메시지를 남겨주세요
            </p>

            {/* 방명록 작성 폼 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
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
                <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-400">첫 번째 축하 메시지를 남겨주세요!</p>
                </div>
              ) : (
                guestbook.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-5 shadow-sm border border-slate-100"
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

      {/* 11. Share & RSVP */}
      <section className="relative py-20 px-6 mb-20">
        <div className="max-w-md mx-auto text-center">
          {/* 공유 버튼 */}
          <div className="mb-12">
            <p className={`${t.body} mb-4 opacity-60`}>소중한 분들께 공유해주세요</p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold shadow-lg active:scale-95 transition-all border-2"
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
          <button onClick={() => setIsRsvpOpen(true)} className="w-full py-5 rounded-lg text-white font-bold text-lg shadow-xl active:scale-95 transition-transform" style={{ backgroundColor: theme.primary }}>
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
              className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Noto Serif KR, serif', color: theme.primary }}>
                  참석 여부
                </h3>
                <button
                  onClick={() => setIsRsvpOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* 이름 */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                {/* 참석 여부 */}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-slate-700">참석 여부</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, attending: 'yes' })}
                      className={`flex-1 py-2.5 text-sm rounded-lg font-semibold transition-all ${
                        formData.attending === 'yes'
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      참석합니다
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, attending: 'no' })}
                      className={`flex-1 py-2.5 text-sm rounded-lg font-semibold transition-all ${
                        formData.attending === 'no'
                          ? 'bg-slate-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      불참합니다
                    </button>
                  </div>
                </div>

                {/* 인원 수 (참석할 때만) */}
                {formData.attending === 'yes' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1.5 text-slate-700">성인</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, guest_count: Math.max(1, formData.guest_count - 1) })}
                          className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-sm"
                        >
                          −
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{formData.guest_count}</span>
                        <button
                          onClick={() => setFormData({ ...formData, guest_count: Math.min(10, formData.guest_count + 1) })}
                          className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-sm"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-500">명</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1.5 text-slate-700">소인</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, child_count: Math.max(0, formData.child_count - 1) })}
                          className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-sm"
                        >
                          −
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{formData.child_count}</span>
                        <button
                          onClick={() => setFormData({ ...formData, child_count: Math.min(10, formData.child_count + 1) })}
                          className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-sm"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-500">명</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 메시지 */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700">축하 메시지 (선택)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="축하 메시지를 남겨주세요"
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* 제출 버튼 */}
                <button
                  onClick={handleSubmitRSVP}
                  className="w-full py-3 rounded-lg text-white font-bold text-sm shadow-lg active:scale-95 transition-transform"
                  style={{ backgroundColor: theme.primary }}
                >
                  제출하기
                </button>

                {/* 오늘 하루 보지 않기 */}
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setHours(24, 0, 0, 0);
                    localStorage.setItem('hideRsvpUntil', tomorrow.getTime().toString());
                    setIsRsvpOpen(false);
                  }}
                  className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
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
