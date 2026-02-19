import Image from 'next/image';

interface VertexHubLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function VertexHubLogo({
  className,
  width = 128,
  height = 128,
}: VertexHubLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="VertexHub Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
