type Props = { size?: number };

export function HondaLogo({ size = 36 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-label="Honda"
      role="img"
    >
      <circle cx="20" cy="20" r="20" fill="#CC0000" />
      <path
        d="M13 11h3.3v6.8h7.4V11H27v18h-3.3v-7.6h-7.4V29H13z"
        fill="#ffffff"
      />
    </svg>
  );
}
