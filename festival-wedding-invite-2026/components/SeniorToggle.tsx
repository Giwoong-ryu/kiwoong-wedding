
import React from 'react';

interface SeniorToggleProps {
  isSeniorMode: boolean;
  onToggle: () => void;
}

export const SeniorToggle: React.FC<SeniorToggleProps> = ({ isSeniorMode, onToggle }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <button
        onClick={onToggle}
        className={`shadow-xl px-6 py-4 rounded-full font-bold transition-all transform active:scale-95 ${
          isSeniorMode 
            ? 'bg-slate-900 text-white scale-110' 
            : 'bg-white text-slate-900 border-2 border-slate-200'
        }`}
      >
        {isSeniorMode ? '어르신 모드 ON' : '어르신 모드 OFF'}
      </button>
    </div>
  );
};
