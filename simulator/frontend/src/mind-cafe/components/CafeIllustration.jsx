export default function CafeIllustration({ isNight }) {
  const ink = isNight ? '#3d4f35' : '#4a5e3e';
  const faint = isNight ? '#6a7f62' : '#7a8f6e';

  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 520, height: 'auto' }}>

      {/* Window / background */}
      <rect x="60" y="20" width="180" height="140" rx="4" stroke={faint} strokeWidth="1.5" />
      <line x1="60" y1="90" x2="240" y2="90" stroke={faint} strokeWidth="1" />
      <line x1="150" y1="20" x2="150" y2="160" stroke={faint} strokeWidth="1" />

      {/* Rain drops in window */}
      {isNight && [80,100,120,140,160,170,105,130].map((x, i) => (
        <line key={i} x1={x} y1={30 + (i%3)*20} x2={x-3} y2={45 + (i%3)*20}
          stroke={faint} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      ))}

      {/* Hanging plants / vines */}
      <path d={`M 390 0 Q 400 30 385 55 Q 370 80 390 100`} stroke={ink} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="378" cy="70" rx="14" ry="9" transform="rotate(-20 378 70)" stroke={ink} strokeWidth="1.5" fill="none" />
      <ellipse cx="395" cy="88" rx="12" ry="8" transform="rotate(15 395 88)" stroke={ink} strokeWidth="1.5" fill="none" />
      <ellipse cx="382" cy="52" rx="11" ry="8" transform="rotate(-35 382 52)" stroke={ink} strokeWidth="1.5" fill="none" />

      <path d={`M 440 0 Q 448 25 435 50 Q 420 75 438 95`} stroke={ink} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="428" cy="65" rx="13" ry="8" transform="rotate(20 428 65)" stroke={ink} strokeWidth="1.5" fill="none" />
      <ellipse cx="441" cy="82" rx="11" ry="7" transform="rotate(-10 441 82)" stroke={ink} strokeWidth="1.5" fill="none" />

      {/* Table top */}
      <rect x="60" y="210" width="400" height="14" rx="3" stroke={ink} strokeWidth="1.5" />

      {/* Table legs */}
      <line x1="100" y1="224" x2="88" y2="380" stroke={ink} strokeWidth="2" />
      <line x1="420" y1="224" x2="432" y2="380" stroke={ink} strokeWidth="2" />

      {/* Laptop */}
      <rect x="160" y="130" width="180" height="80" rx="4" stroke={ink} strokeWidth="1.5" />
      <rect x="155" y="207" width="190" height="10" rx="3" stroke={ink} strokeWidth="1.5" />
      {/* Music note on screen */}
      <text x="242" y="178" fontSize="22" fill={faint} fontFamily="serif" textAnchor="middle">♪</text>
      {/* Keyboard hint lines */}
      <line x1="175" y1="200" x2="325" y2="200" stroke={faint} strokeWidth="0.8" />
      <line x1="175" y1="196" x2="325" y2="196" stroke={faint} strokeWidth="0.8" />

      {/* Coffee cup */}
      <path d="M 370 170 L 365 210 Q 365 215 375 215 L 405 215 Q 415 215 415 210 L 410 170 Z"
        stroke={ink} strokeWidth="1.5" />
      {/* Handle */}
      <path d="M 410 180 Q 428 180 428 192 Q 428 204 410 204" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
      {/* Saucer */}
      <ellipse cx="390" cy="215" rx="30" ry="5" stroke={ink} strokeWidth="1.5" />
      {/* Steam */}
      <path d="M 378 165 Q 374 155 378 145" stroke={faint} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M 390 163 Q 386 152 390 140" stroke={faint} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M 402 165 Q 398 155 402 145" stroke={faint} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Notebook */}
      <rect x="120" y="180" width="75" height="55" rx="2" stroke={ink} strokeWidth="1.5" />
      {/* Spine lines */}
      <line x1="125" y1="180" x2="125" y2="235" stroke={ink} strokeWidth="2" />
      {/* Ruled lines */}
      {[195,202,209,216,223,230].map((y, i) => (
        <line key={i} x1="130" y1={y} x2="188" y2={y} stroke={faint} strokeWidth="0.7" />
      ))}

      {/* Small plant pot */}
      <path d="M 290 180 L 285 210 L 315 210 L 310 180 Z" stroke={ink} strokeWidth="1.5" />
      <ellipse cx="300" cy="180" rx="15" ry="5" stroke={ink} strokeWidth="1.5" />
      {/* Plant stem and leaves */}
      <line x1="300" y1="178" x2="300" y2="152" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="290" cy="162" rx="12" ry="7" transform="rotate(-30 290 162)" stroke={ink} strokeWidth="1.5" fill="none" />
      <ellipse cx="310" cy="157" rx="11" ry="7" transform="rotate(25 310 157)" stroke={ink} strokeWidth="1.5" fill="none" />
      <ellipse cx="299" cy="153" rx="9" ry="6" transform="rotate(-5 299 153)" stroke={ink} strokeWidth="1.5" fill="none" />

      {/* Scattered dots / atmosphere */}
      {[80,130,180,350,390,430,460,480,90,110,350,410].map((x, i) => (
        <circle key={i} cx={x} cy={90 + (i%5)*28} r="1.5" fill={faint} opacity="0.4" />
      ))}

      {/* Floor line */}
      <line x1="40" y1="380" x2="480" y2="380" stroke={faint} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
