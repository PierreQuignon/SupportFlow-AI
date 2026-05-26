interface SupportFlowLogoProps {
  width?: number | string;
  height?: number | string;
}

export const SupportFlowLogo = ({ width = 280, height = 'auto' }: SupportFlowLogoProps) => (
  <svg width={width} height={height} viewBox="0 0 680 260" role="img" xmlns="http://www.w3.org/2000/svg">
    <title>SupportFlow AI Logo</title>

    {/* Icon background pill */}
    <rect x="260" y="40" width="160" height="120" rx="28" fill="#6C3BF5" />

    {/* Envelope body */}
    <rect x="283" y="66" width="114" height="76" rx="6" fill="#fff" opacity="0.15" />
    <rect x="283" y="66" width="114" height="76" rx="6" fill="none" stroke="#fff" strokeWidth="2.5" />

    {/* Envelope flap */}
    <polyline points="283,66 340,108 397,66" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />

    {/* AI spark — orange accent */}
    <line x1="392" y1="58" x2="404" y2="50" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="398" y1="65" x2="413" y2="62" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="395" y1="72" x2="408" y2="74" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />

    <circle cx="404" cy="50" r="3" fill="#FF6B35" />
    <circle cx="413" cy="62" r="3" fill="#FF6B35" />
    <circle cx="408" cy="74" r="3" fill="#FF6B35" />

    {/* App name with accent on "AI" */}
    <text
      x="340"
      y="198"
      textAnchor="middle"
      fontSize="28"
      fontWeight="500"
      fontFamily="-apple-system, 'Segoe UI', sans-serif"
      fill="#1A1A2E"
    >
      SupportFlow{' '}
      <tspan fill="#6C3BF5">AI</tspan>
    </text>

    {/* Tagline */}
    <text
      x="340"
      y="226"
      textAnchor="middle"
      fontSize="11"
      fontWeight="400"
      fontFamily="-apple-system, 'Segoe UI', sans-serif"
      fill="#8A8A9A"
    >
      AUTOMATED CUSTOMER SUPPORT
    </text>
  </svg>
);
