interface TonLogoProps {
  size?: number;
  className?: string;
}

export function TonLogo({ size = 20, className }: TonLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z"
        fill="#0098EA"
      />
      <path
        d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5765 22.4861C43.3045 19.4202 41.0761 15.6277 37.5603 15.6277ZM26.2031 36.01L24.4751 32.8269L17.2386 20.0372C16.7489 19.1832 17.3786 18.105 18.4386 18.105H26.2031V36.01ZM38.7613 20.0372L31.5765 32.8269L29.7969 36.01V18.105H37.5603C38.6203 18.105 39.2501 19.1832 38.7613 20.0372Z"
        fill="white"
      />
    </svg>
  );
}
