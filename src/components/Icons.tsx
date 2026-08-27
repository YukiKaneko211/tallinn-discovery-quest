interface IconProps {
  size?: number;
  className?: string;
}

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconPin = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

export const IconCamera = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.2-2h6.2l1.2 2h2.7A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
    <circle cx="12" cy="13" r="3.6" />
  </svg>
);

export const IconBook = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z" />
    <path d="M9 4v16" />
    <path d="M12 8h3M12 12h3" />
  </svg>
);

export const IconBack = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

export const IconQuestion = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9.2 9a2.9 2.9 0 1 1 3.8 2.8c-.8.3-1 .9-1 1.7v.4" />
    <circle cx="12" cy="17.6" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPoint = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className} strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M10 17V7.6h2.7a2.9 2.9 0 0 1 0 5.8H10" strokeWidth={2} />
  </svg>
);

export const IconPlay = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M7 4.5v15l13-7.5Z" />
  </svg>
);

export const IconCaretDown = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M4 7h16l-8 13Z" />
  </svg>
);

export const IconLock = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="M12 2.6a4.6 4.6 0 0 0-4.6 4.6V10H6.6A1.6 1.6 0 0 0 5 11.6v8A1.6 1.6 0 0 0 6.6 21h10.8a1.6 1.6 0 0 0 1.6-1.6v-8A1.6 1.6 0 0 0 17.4 10h-.8V7.2A4.6 4.6 0 0 0 12 2.6Zm2.6 7.4H9.4V7.2a2.6 2.6 0 0 1 5.2 0Z" />
  </svg>
);

export const IconText = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <text x="12" y="18" textAnchor="middle" fontSize="17" fontWeight="800" fontFamily="inherit">
      A
    </text>
  </svg>
);

export const IconDeco = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 13.5A8 8 0 1 1 10.5 4a6.4 6.4 0 0 0 9.5 9.5Z" />
  </svg>
);

export const IconSparkle = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="M13 2 15 8l6 2-6 2-2 6-2-6-6-2 6-2Z" />
    <path d="M5.5 14 6.5 17l3 1-3 1-1 3-1-3-3-1 3-1Z" />
  </svg>
);

export const IconCrop = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6.5 2v15.5H22" />
    <path d="M2 6.5h15.5V22" />
  </svg>
);

export const IconBrightness = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
  </svg>
);

export const IconContrast = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
  </svg>
);

export const IconSaturation = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 16a8 8 0 0 1 16 0" />
    <path d="M7.5 16a4.5 4.5 0 0 1 9 0" />
    <path d="M2 20h20" />
  </svg>
);

export const IconPalette = ({ size, className }: IconProps) => (
  <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="pal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff4d4d" />
        <stop offset="33%" stopColor="#ffd24d" />
        <stop offset="66%" stopColor="#4dd2ff" />
        <stop offset="100%" stopColor="#b84dff" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#pal)" />
    <circle cx="12" cy="12" r="3.2" fill="#fff" />
  </svg>
);

export const IconSharpness = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="M12 4 21 20H3Z" />
  </svg>
);

export const IconFlipH = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3v18" strokeDasharray="3 3" />
    <path d="M9 6 3 12l6 6Z" />
    <path d="M15 6l6 6-6 6Z" />
  </svg>
);

export const IconFlipV = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 12h18" strokeDasharray="3 3" />
    <path d="M6 9 12 3l6 6Z" />
    <path d="M6 15l6 6 6-6Z" />
  </svg>
);

export const IconRotate = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 3v5h-5" />
  </svg>
);

export const IconTrash = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
  </svg>
);

export const IconEdit = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16Z" />
  </svg>
);

export const IconAlignLeft = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6h16M4 11h10M4 16h14M4 21h8" />
  </svg>
);

export const IconAlignCenter = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6h16M7 11h10M5 16h14M8 21h8" />
  </svg>
);

export const IconAlignRight = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6h16M10 11h10M6 16h14M12 21h8" />
  </svg>
);

export const IconFontSize = ({ size, className }: IconProps) => (
  <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" className={className} fill="currentColor">
    <text x="1" y="19" fontSize="15" fontWeight="800" fontFamily="inherit">
      A
    </text>
    <text x="12" y="19" fontSize="21" fontWeight="800" fontFamily="inherit">
      A
    </text>
  </svg>
);

export const IconStyle = ({ size, className }: IconProps) => (
  <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" className={className}>
    <text
      x="12"
      y="19"
      textAnchor="middle"
      fontSize="19"
      fontWeight="800"
      fontFamily="inherit"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      A
    </text>
  </svg>
);

export const IconSave = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
    <path d="M4 17v3h16v-3" />
  </svg>
);

export const IconSearch = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);
