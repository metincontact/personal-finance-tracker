import type { CSSProperties } from 'react';

interface Props {
  width?: string | number;
  height?: string | number;
  radius?: number;
  style?: CSSProperties;
}

export default function Skeleton({ width = '100%', height = 14, radius = 8, style }: Props) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
