import { useState } from 'react';
import { VisitorCount } from './VisitorCount';

const FriendsWelcome = () => {
  const [isCelebrating, setIsCelebrating] = useState(false);

  return (
    <section className="flex w-full flex-col items-center text-center lg:items-start lg:text-left">
      <button
        type="button"
        aria-label="Celebrate friendship"
        aria-pressed={isCelebrating}
        onClick={() => setIsCelebrating((celebrating) => !celebrating)}
        className={`friends-art group w-full max-w-[30rem] cursor-pointer rounded-[2rem] border border-white/70 bg-white/55 p-3 shadow-xl shadow-emerald-900/10 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${isCelebrating ? 'friends-art--celebrating' : ''}`}
      >
        <svg viewBox="0 0 480 330" role="img" aria-label="Friends sharing expenses together" className="friends-art__scene h-auto w-full overflow-visible">
          <defs>
            <linearGradient id="phoneGradient" x1="170" y1="70" x2="310" y2="275" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#ecfdf5" />
            </linearGradient>
            <filter id="softShadow" x="120" y="36" width="240" height="280" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#065f46" floodOpacity=".16" />
            </filter>
          </defs>

          <path d="M101 163c40-40 69-67 112-68m67 0c45 5 73 30 104 66m-280 1c12 62 49 91 105 103m73-1c56-12 89-43 103-102" fill="none" stroke="#a7f3d0" strokeDasharray="7 9" strokeLinecap="round" strokeWidth="6" />

          <g className="friends-art__sparkle" fill="#f59e0b">
            <path d="m91 69 5 12 12 5-12 5-5 12-5-12-12-5 12-5z" />
            <path d="m393 89 4 9 9 4-9 4-4 9-4-9-9-4 9-4z" />
            <path d="m371 249 5 11 11 5-11 5-5 11-5-11-11-5 11-5z" />
            <path d="m106 245 4 8 8 4-8 4-4 8-4-8-8-4 8-4z" />
          </g>

          <g filter="url(#softShadow)">
            <rect x="174" y="45" width="132" height="242" rx="28" fill="url(#phoneGradient)" stroke="#d1fae5" strokeWidth="4" />
            <rect x="188" y="70" width="104" height="185" rx="16" fill="#fff" />
            <rect x="222" y="55" width="36" height="5" rx="2.5" fill="#a7f3d0" />
            <circle cx="240" cy="91" r="19" fill="#d1fae5" />
            <path d="M240 80v22m7-17c-2-4-12-5-14 0-3 7 14 5 14 11s-11 8-15 2" stroke="#059669" strokeLinecap="round" strokeWidth="3" />
            <rect x="201" y="122" width="78" height="9" rx="4.5" fill="#d1d5db" />
            <rect x="201" y="141" width="58" height="7" rx="3.5" fill="#e5e7eb" />
            <rect x="201" y="165" width="78" height="42" rx="12" fill="#ecfdf5" />
            <circle cx="216" cy="186" r="9" fill="#10b981" />
            <path d="m212 186 3 3 5-6" fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <rect x="232" y="178" width="37" height="6" rx="3" fill="#6ee7b7" />
            <rect x="232" y="189" width="26" height="5" rx="2.5" fill="#a7f3d0" />
            <rect x="201" y="218" width="78" height="24" rx="12" fill="#10b981" />
            <path d="M225 230h30" stroke="white" strokeLinecap="round" strokeWidth="4" />
          </g>

          <g className="friends-art__person friends-art__person--blue">
            <circle cx="94" cy="162" r="42" fill="white" stroke="#bfdbfe" strokeWidth="5" />
            <circle cx="94" cy="150" r="12" fill="#3b82f6" />
            <path d="M72 179c2-13 10-19 22-19s20 6 22 19v5H72z" fill="#3b82f6" />
          </g>
          <g className="friends-art__person friends-art__person--violet">
            <circle cx="130" cy="263" r="36" fill="white" stroke="#ddd6fe" strokeWidth="5" />
            <circle cx="130" cy="253" r="10" fill="#8b5cf6" />
            <path d="M111 278c2-11 8-16 19-16s17 5 19 16v4h-38z" fill="#8b5cf6" />
          </g>
          <g className="friends-art__person friends-art__person--orange">
            <circle cx="386" cy="162" r="42" fill="white" stroke="#fed7aa" strokeWidth="5" />
            <circle cx="386" cy="150" r="12" fill="#f97316" />
            <path d="M364 179c2-13 10-19 22-19s20 6 22 19v5h-44z" fill="#f97316" />
          </g>
          <g className="friends-art__person friends-art__person--teal">
            <circle cx="350" cy="263" r="36" fill="white" stroke="#99f6e4" strokeWidth="5" />
            <circle cx="350" cy="253" r="10" fill="#14b8a6" />
            <path d="M331 278c2-11 8-16 19-16s17 5 19 16v4h-38z" fill="#14b8a6" />
          </g>

          <g className="friends-art__coin">
            <circle cx="127" cy="89" r="22" fill="#fef3c7" stroke="#fcd34d" strokeWidth="3" />
            <path d="M127 78v22m6-16c-2-4-11-4-13 0-3 6 13 5 13 10s-10 7-14 2" stroke="#d97706" strokeLinecap="round" strokeWidth="2.5" />
          </g>
          <g className="friends-art__heart">
            <path d="M351 82c-9-12-27 0 0 24 27-24 9-36 0-24Z" fill="#fb7185" />
          </g>
        </svg>
        <span className="mt-1 block text-xs font-medium text-emerald-700">Tap to celebrate your friends ✨</span>
      </button>

      <blockquote className="mt-6 max-w-xl px-2 text-lg font-semibold leading-relaxed text-emerald-950 sm:text-xl">
        <span className="block">“Dosti apni ekdum khaas hai,</span>
        <span className="block">Paise ka hisaab bas bakwaas hai,</span>
        <span className="block">Splitwise mein jo bhi tera hai,</span>
        <span className="block">Bhai samajh le woh mera bhi hai! 😂❤️”</span>
      </blockquote>
      <VisitorCount />
    </section>
  );
};

export default FriendsWelcome;
