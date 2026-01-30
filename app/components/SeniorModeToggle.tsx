'use client';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

export default function SeniorModeToggle({ enabled, onToggle }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onToggle}
        className={`
          shadow-xl px-6 py-4 rounded-full font-bold
          transition-all transform active:scale-95
          ${enabled
            ? 'bg-text text-white scale-110'
            : 'bg-white text-text border-2 border-gray-200'
          }
        `}
        aria-label="어르신 모드 토글"
      >
        {enabled ? '어르신 모드 ON' : '어르신 모드 OFF'}
      </button>
    </div>
  );
}
