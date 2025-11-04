import { clsx } from 'clsx'

export function Button({ as: As = 'button', className, ...props }: any) {
  return (
    <As
      className={clsx('px-4 py-2 rounded-lg glass neon-edge focus-ring inline-flex items-center justify-center', className)}
      {...props}
    />
  )
}
