
import React, { useState, useEffect } from 'react';
import { ThemeOption, AppState } from './types';
import { THEMES, TYPOGRAPHY, SECTIONS } from './constants';
import { SeniorToggle } from './components/SeniorToggle';
import { Section } from './components/Section';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isSeniorMode: false,
    activeTheme: ThemeOption.SOFT_SAGE,
  });

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const theme = THEMES[state.activeTheme];

  const toggleSeniorMode = () => {
    setState(prev => ({ ...prev, isSeniorMode: !prev.isSeniorMode }));
  };

  const changeTheme = (newTheme: ThemeOption) => {
    setState(prev => ({ ...prev, activeTheme: newTheme }));
  };

  const t = state.isSeniorMode ? {
    h1: TYPOGRAPHY.senior_h1,
    h2: TYPOGRAPHY.senior_h2,
    body: TYPOGRAPHY.senior_body,
  } : {
    h1: TYPOGRAPHY.h1,
    h2: TYPOGRAPHY.h2,
    body: TYPOGRAPHY.body,
  };

  return (
    <main 
      className="min-h-screen transition-colors duration-500" 
      style={{ backgroundColor: theme.bgMain, color: theme.textMain }}
    >
      {/* Theme Switcher for Demo */}
      <div className="fixed top-4 left-4 z-40 flex gap-2">
        {Object.values(ThemeOption).map((opt) => (
          <button
            key={opt}
            onClick={() => changeTheme(opt)}
            className={`w-4 h-4 rounded-full border border-slate-300 ${
              state.activeTheme === opt ? 'ring-2 ring-slate-400' : ''
            }`}
            style={{ backgroundColor: THEMES[opt].primary }}
            title={opt}
          />
        ))}
      </div>

      <SeniorToggle isSeniorMode={state.isSeniorMode} onToggle={toggleSeniorMode} />

      {/* 1. Hero Section */}
      <section 
        className="h-screen relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ backgroundImage: `url('https://picsum.photos/seed/wedding1/800/1200')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        <div className="relative z-10 text-white animate-fade-in-up">
          <p className={`${t.body} mb-4 font-medium uppercase tracking-[0.2em]`}>Our Own Small Festival</p>
          <h1 className={`${t.h1} serif mb-2`}>준수 & 민지</h1>
          <p className={`${t.body} mt-8`}>2026. 05. 23. SAT PM 1:00</p>
          <p className={`${t.body}`}>가든 하우스 성수</p>
        </div>
        <div className="absolute bottom-10 animate-bounce text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
      </section>

      {/* 2. Invitation Message */}
      <Section id="invite" className="text-center">
        <h2 className={`${t.h2} mb-8 serif`} style={{ color: theme.primary }}>소중한 당신을 초대합니다</h2>
        <div className={`${t.body} whitespace-pre-wrap space-y-4 font-light italic`}>
          {`좋은 날, 좋은 사람들과 함께\n작은 축제를 열고자 합니다.\n\n격식 없이 가볍게 오셔서\n저희의 새로운 시작을\n축복해 주시면 감사하겠습니다.`}
        </div>
        <div className="mt-12 h-px w-20 mx-auto bg-slate-300" />
      </Section>

      {/* 3. Photo Gallery (Simplified Bento) */}
      <Section id="gallery" className="bg-slate-50/50">
        <h2 className={`${t.h2} mb-10 text-center serif`}>우리의 기록</h2>
        <div className="grid grid-cols-2 gap-3">
          <img src="https://picsum.photos/seed/wed2/400/600" alt="Gallery 1" className="rounded-2xl object-cover h-64 w-full" />
          <img src="https://picsum.photos/seed/wed3/400/400" alt="Gallery 2" className="rounded-2xl object-cover h-32 w-full mt-auto" />
          <img src="https://picsum.photos/seed/wed4/400/400" alt="Gallery 3" className="rounded-2xl object-cover h-32 w-full mb-auto" />
          <img src="https://picsum.photos/seed/wed5/400/600" alt="Gallery 4" className="rounded-2xl object-cover h-64 w-full" />
        </div>
      </Section>

      {/* 4. When & Where */}
      <Section id="info">
        <div 
          className="rounded-3xl p-8 shadow-sm border border-slate-100" 
          style={{ backgroundColor: theme.bgSection }}
        >
          <div className="mb-8">
            <h3 className={`${t.h2} mb-2 serif`}>언제</h3>
            <p className={`${t.body}`}>2026년 5월 23일 토요일</p>
            <p className={`${t.body} font-bold`} style={{ color: theme.primary }}>오후 1시</p>
          </div>
          <div>
            <h3 className={`${t.h2} mb-2 serif`}>어디서</h3>
            <p className={`${t.body}`}>가든 하우스 성수</p>
            <p className={`${t.body} text-sm opacity-70`}>서울특별시 성동구 성수동 123-45</p>
          </div>
        </div>
      </Section>

      {/* 5. Simple Map Link */}
      <Section id="map" className="py-0">
        <div className="rounded-3xl overflow-hidden shadow-inner bg-slate-200 aspect-video flex items-center justify-center relative group">
           <img src="https://picsum.photos/seed/map/800/450" alt="Map Placeholder" className="w-full h-full object-cover opacity-80" />
           <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
             <button className="bg-white/90 backdrop-blur px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
               네이버 지도 열기
             </button>
           </div>
        </div>
      </Section>

      {/* 6. Special Notice: No Gift */}
      <Section id="gift" className="text-center">
        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
            🎁
          </div>
          <h2 className={`${t.h2} mb-4 font-bold`}>축의금은 사양합니다</h2>
          <p className={`${t.body} mb-6 text-slate-600`}>
            현장에서는 축의금을 받지 않습니다.<br/>축하해 주시는 마음만으로 충분합니다.
          </p>
          
          <button 
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="text-sm font-medium underline underline-offset-4 opacity-50 hover:opacity-100 transition-opacity"
          >
            {isAccountOpen ? '계좌번호 닫기' : '정 마음을 전하고 싶으시다면...'}
          </button>

          {isAccountOpen && (
            <div className="mt-6 space-y-3 animate-fade-in-up">
              <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <span className="text-xs font-bold text-slate-400">신랑 김준수</span>
                <span className="font-mono text-sm">카카오뱅크 123-456-7890</span>
                <button className="text-[10px] bg-slate-100 px-2 py-1 rounded">복사</button>
              </div>
              <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <span className="text-xs font-bold text-slate-400">신부 이미진</span>
                <span className="font-mono text-sm">국민은행 98765-43-21012</span>
                <button className="text-[10px] bg-slate-100 px-2 py-1 rounded">복사</button>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 7. RSVP / Footer */}
      <Section id="rsvp" className="mb-20">
        <div className="text-center">
          <h2 className={`${t.h2} mb-4 serif`}>RSVP</h2>
          <p className={`${t.body} mb-8 opacity-60 text-sm`}>참석 인원 파악을 위해 5월 10일까지 알려주세요.</p>
          <button 
            className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 transition-transform"
            style={{ backgroundColor: theme.primary }}
          >
            참석 여부 전달하기
          </button>
        </div>
        
        <footer className="mt-20 text-center opacity-30 text-xs tracking-widest pb-10">
          &copy; 2026 JUNSU & MINJI. DESIGNED FOR OUR SMALL FESTIVAL.
        </footer>
      </Section>
    </main>
  );
};

export default App;
