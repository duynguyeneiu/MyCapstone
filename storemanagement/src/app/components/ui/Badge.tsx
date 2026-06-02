import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Badge({ children, style = {} }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      background: 'var(--teal-lt)',
      color: 'var(--teal-dk)',
      borderRadius: 9999,
      padding: '.15rem .65rem',
      fontSize: '.72rem',
      fontWeight: 600,
      ...style,
    }}>
      {children}
    </span>
  );
}
