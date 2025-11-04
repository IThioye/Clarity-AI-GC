import { clsx } from 'clsx'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx('glass px-3 py-2 rounded-lg w-full outline-none', props.className)} />
}
