type FaqIllustrationProps = {
  className?: string;
  title?: string;
};

/** Decorative FAQ / SSS illustration for the homepage section. */
export function FaqIllustration({
  className,
  title = "Sık sorulan sorular görseli",
}: FaqIllustrationProps) {
  return (
    <svg
      viewBox="0 0 420 420"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="faq-bg" x1="60" y1="40" x2="380" y2="390" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8F1EC" />
          <stop offset="1" stopColor="#F7F8F5" />
        </linearGradient>
        <linearGradient id="faq-card" x1="90" y1="70" x2="330" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F7F8F5" />
        </linearGradient>
      </defs>

      <rect width="420" height="420" rx="36" fill="url(#faq-bg)" />

      {/* Soft leaf accents */}
      <path
        d="M68 292c28-46 74-70 118-74-18 42-58 74-118 74Z"
        fill="#0E5A39"
        opacity="0.08"
      />
      <path
        d="M348 96c-24 38-66 60-108 66 16-38 52-66 108-66Z"
        fill="#0E5A39"
        opacity="0.1"
      />

      {/* Main panel */}
      <rect
        x="78"
        y="78"
        width="264"
        height="264"
        rx="28"
        fill="url(#faq-card)"
        stroke="#DCE4DF"
        strokeWidth="2"
      />

      {/* Q&A rows */}
      <g>
        <circle cx="118" cy="138" r="18" fill="#0E5A39" />
        <text
          x="118"
          y="144"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, sans-serif"
          fontSize="16"
          fontWeight="700"
        >
          ?
        </text>
        <rect x="150" y="124" width="150" height="12" rx="6" fill="#0E5A39" opacity="0.18" />
        <rect x="150" y="146" width="108" height="10" rx="5" fill="#DCE4DF" />
      </g>

      <g>
        <circle cx="118" cy="210" r="18" fill="#0B3D28" />
        <text
          x="118"
          y="216"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, sans-serif"
          fontSize="15"
          fontWeight="700"
        >
          !
        </text>
        <rect x="150" y="196" width="162" height="12" rx="6" fill="#0E5A39" opacity="0.14" />
        <rect x="150" y="218" width="120" height="10" rx="5" fill="#DCE4DF" />
      </g>

      <g>
        <circle cx="118" cy="282" r="18" fill="#A83B42" opacity="0.9" />
        <text
          x="118"
          y="288"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, sans-serif"
          fontSize="16"
          fontWeight="700"
        >
          ?
        </text>
        <rect x="150" y="268" width="138" height="12" rx="6" fill="#0E5A39" opacity="0.12" />
        <rect x="150" y="290" width="96" height="10" rx="5" fill="#DCE4DF" />
      </g>

      {/* Floating chat bubble */}
      <g transform="translate(286 248)">
        <path
          d="M0 18c0-18 14-32 32-32h46c18 0 32 14 32 32v28c0 18-14 32-32 32H48l-18 16v-16H32C14 78 0 64 0 46V18Z"
          fill="#0E5A39"
        />
        <circle cx="36" cy="34" r="5" fill="#FFFFFF" />
        <circle cx="55" cy="34" r="5" fill="#FFFFFF" opacity="0.85" />
        <circle cx="74" cy="34" r="5" fill="#FFFFFF" opacity="0.7" />
      </g>
    </svg>
  );
}
