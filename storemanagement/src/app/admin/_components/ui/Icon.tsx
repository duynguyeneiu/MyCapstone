'use client';

export default function Icon({ name, size = 22, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  return <span className="ms" style={{ fontSize: size, ...style }}>{name}</span>;
}
