import type { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  full?: boolean
}

export default function Button({ variant='primary', full, className, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent'
  const sizes = 'h-10 px-4'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-accent text-white hover:bg-accent/90',
    ghost: 'bg-transparent text-primary hover:bg-primary/10'
  }[variant]
  return <button className={clsx(base, sizes, variants, full && 'w-full', className)} {...rest} />
}
