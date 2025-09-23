// import type { ButtonHTMLAttributes } from 'react'
// import { clsx } from 'clsx'

// type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
//   variant?: 'primary' | 'secondary' | 'ghost'
//   full?: boolean
// }

// export default function Button({ variant='primary', full, className, ...rest }: Props) {
//   const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent'
//   const sizes = 'h-10 px-4'
//   const variants = {
//     primary: 'bg-primary text-white hover:bg-primary/90',
//     secondary: 'bg-accent text-white hover:bg-accent/90',
//     ghost: 'bg-transparent text-primary hover:bg-primary/10'
//   }[variant]
//   return <button className={clsx(base, sizes, variants, full && 'w-full', className)} {...rest} />
// }

import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
};

export default function Button({
  variant = 'primary',
  size = 'md',
  full,
  className,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
    'disabled:opacity-60 disabled:pointer-events-none';

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }[size];

  const variants = {
    primary:
      'bg-gradient-to-b from-primary to-primary/90 text-white shadow-sm hover:shadow ' +
      'active:translate-y-[0.5px]',
    secondary:
      'bg-accent text-white shadow-sm hover:bg-accent/90 active:translate-y-[0.5px]',
    soft:
      'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/12 active:translate-y-[0.5px]',
    ghost:
      'bg-transparent text-primary hover:bg-primary/10 active:translate-y-[0.5px]',
  }[variant];

  return (
    <button
      className={clsx(base, sizes, variants, full && 'w-full', className)}
      {...rest}
    />
  );
}
