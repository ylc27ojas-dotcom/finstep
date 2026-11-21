interface LogoProps {
  className?: string;
}

/** FinStep mark: three rising steps inside a rounded square. */
export function LogoMark({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0b1220" />
      <rect x="7" y="18" width="5" height="7" rx="1.2" fill="#e7f3ef" />
      <rect x="13.5" y="13" width="5" height="12" rx="1.2" fill="#6cc3ab" />
      <rect x="20" y="7" width="5" height="18" rx="1.2" fill="#0e9c80" />
    </svg>
  );
}
