export default function FallbackScene({ title, description, loading = false }: { title: string; description: string; loading?: boolean }) {
  return <div className={`fallback-scene ${loading ? 'is-loading' : ''}`}>
    <svg viewBox="0 0 600 600" className="fallback-drawing" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8b9183" /><stop offset="1" stopColor="#292e27" /></linearGradient>
        <linearGradient id="display" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ed572b" /><stop offset="1" stopColor="#98462d" /></linearGradient>
        <pattern id="mat-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" stroke="#9da294" strokeOpacity=".11" /></pattern>
      </defs>
      <path d="m48 385 280-137 231 127-274 147Z" fill="#31382e" stroke="#68705f" />
      <path d="m48 385 280-137 231 127-274 147Z" fill="url(#mat-grid)" />
      <g transform="translate(45 70) rotate(-9 250 250)">
        <path d="m42 238 220-49 168 105-217 62Z" fill="url(#body)" stroke="#abb19e" />
        <path d="m67 230 197-42 137 84-188 52Z" fill="#383d32" stroke="#727a63" />
        <path d="m88 224 165-34 112 66-165 44Z" stroke="#adb598" strokeDasharray="7 6" strokeWidth="10" />
        <path d="m188 300 46-12 42 26-47 13Z" stroke="#919a81" />
        <path d="m42 238-4-176 217-40 7 167Z" fill="url(#body)" stroke="#abb19e" strokeWidth="2" />
        <path d="m53 220-4-149 194-36 6 145Z" fill="#20271f" stroke="#65715a" />
        <path d="m78 164 59-44 91 32-70 40Z" fill="url(#display)" />
        <path d="m84 99 134-25M86 107l72-14" stroke="#d9ddcb" strokeOpacity=".6" />
      </g>
      <g transform="translate(354 255) rotate(19)">
        <rect width="100" height="175" rx="15" fill="url(#body)" stroke="#c2c9b3" strokeWidth="2" />
        <rect x="8" y="9" width="84" height="157" rx="9" fill="#141b14" />
        <path d="m8 110 84-39v63l-84 32Z" fill="url(#display)" />
        <path d="M25 43h50M25 51h26" stroke="#e8eadb" />
        <rect x="37" y="14" width="26" height="5" rx="2.5" fill="#77866b" />
      </g>
      <path d="M90 252H37v66M450 310h98v-93" stroke="#ed572b" strokeOpacity=".7" strokeDasharray="3 4" />
      <circle cx="90" cy="252" r="4" fill="#ed572b" /><circle cx="450" cy="310" r="4" fill="#ed572b" />
      <path d="M84 457h56m-28-28v56M494 142h26m-13-13v26" stroke="#89967e" strokeOpacity=".5" />
    </svg>
    <div className="fallback-caption"><span className="status-dot" /><strong>{title}</strong><p>{description}</p></div>
  </div>
}
