import { clsx } from 'clsx'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('glass-surface p-6 rounded-xl', className)} {...props} />
}
