"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  href?: string;
}

const sizeMap = { sm: 28, md: 40, lg: 56 };

export function LogoIcon({
  className,
  size = 'md',
  variant = 'default',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}) {
  const px = sizeMap[size];
  const color = variant === 'white' ? '#FFFFFF' : '#0F2C5C';
  const gold = '#C9A86A';

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="30" cy="30" r="30" fill={variant === 'white' ? 'rgba(255,255,255,0.12)' : '#0F2C5C'} />

      {/* Bar chart columns — ascending left to right */}
      <rect x="10" y="34" width="5" height="14" rx="1.5" fill={gold} />
      <rect x="17" y="28" width="5" height="20" rx="1.5" fill={gold} opacity="0.85" />
      <rect x="24" y="22" width="5" height="26" rx="1.5" fill={gold} opacity="0.9" />
      <rect x="31" y="16" width="5" height="32" rx="1.5" fill={variant === 'white' ? '#fff' : '#fff'} />
      <rect x="38" y="20" width="5" height="28" rx="1.5" fill={gold} opacity="0.7" />
      
      {/* Baseline */}
      <rect x="8" y="49" width="34" height="2" rx="1" fill={variant === 'white' ? 'rgba(255,255,255,0.4)' : gold} />
      
      {/* Rising trend arrow */}
      <path
        d="M44 26 L50 18 M50 18 L50 24 M50 18 L44 18"
        stroke={gold}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
  size = 'md',
  variant = 'default',
  href = '/',
}: LogoProps) {
  const textColor = variant === 'white' ? 'text-white' : 'text-navy-900';
  const subColor = variant === 'white' ? 'text-white/60' : 'text-gold-DEFAULT';

  const content = (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <LogoIcon size={size} variant={variant} />
      {showText && (
        <div className="leading-none">
          <div className={cn('font-headline font-bold tracking-wide', textColor,
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
          )}>
            كويك ديل
          </div>
          <div className={cn('text-[10px] uppercase tracking-[0.2em] font-medium mt-0.5', subColor)}>
            Quick Deal
          </div>
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="hover:opacity-90 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  );
}
