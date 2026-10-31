/** Seettu mark: a circle (the "seettu") with members sitting on it. */
export function LogoMark({ size = 36 }) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Seettu LK"
    >
      <rect width="40" height="40" rx="11" className="logo-mark__bg" />
      <circle cx="20" cy="20" r="10.5" fill="none" className="logo-mark__ring" strokeWidth="2.2" />
      <circle cx="20" cy="9.5" r="3" className="logo-mark__dot" />
      <circle cx="29.1" cy="25.25" r="3" className="logo-mark__dot" />
      <circle cx="10.9" cy="25.25" r="3" className="logo-mark__dot" />
    </svg>
  );
}

function Logo({ size = 36, showTagline = false }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo__text">
        <span className="logo__name">Seettu LK</span>
        {showTagline && <span className="logo__tag">Pool orders, split smarter</span>}
      </span>
    </span>
  );
}

export default Logo;
