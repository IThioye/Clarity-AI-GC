import Link from 'next/link'
import { ArrowRightCircle, Star } from 'lucide-react'

type Row = { label: string; free: string; plus: string; pro: string }

const rows: Row[] = [
  { label: 'Price', free: '$0', plus: '$15 / mo', pro: '$50 / mo' },
  { label: 'Who it’s for', free: 'Individuals starting their journey', plus: 'Individuals seeking deeper growth', pro: 'Therapists & coaches' },
  { label: 'Journal Entries', free: '50 entries', plus: 'Unlimited', pro: 'Unlimited (per client)' },
  { label: 'Insights', free: 'Basic mood & keyword trends', plus: 'Advanced personal insights & progress tracking', pro: 'Client analytics & professional insights' },
  { label: 'Goals & Plans', free: 'Simple checklists', plus: 'Adaptive action plans', pro: 'Clinical planning tools' },
  { label: 'Privacy', free: '🔒 End-to-End Encrypted', plus: '🔒 End-to-End Encrypted', pro: '🔒 HIPAA-ready Encryption' },
  { label: 'Support', free: 'Email', plus: 'Priority Support', pro: 'Dedicated Account Manager' },
]

export default function PricingPage() {
  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Choose your path to <span className="bg-gradient-to-r from-[#C58AFF] via-[#B596FF] to-[#8FC8FF] bg-clip-text text-transparent">Clarity</span></h1>
        <p className="text-text-secondary mt-2">Start free, upgrade anytime. Your data always stays private.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-stretch">
        <div className="glass rounded-2xl p-5 flex flex-col">
          <div className="text-sm text-text-secondary">Clarity</div>
          <div className="text-2xl font-semibold mt-1">Free</div>
          <div className="mt-4 text-sm flex-1 divide-y divide-white/5">
            {rows.map((r) => (
              <div key={r.label} className="py-2 grid grid-cols-[110px_1fr] md:grid-cols-[150px_1fr] gap-3 items-start">
                <div className="text-text-secondary">{r.label}</div>
                <div className="min-w-0">{r.free}</div>
              </div>
            ))}
          </div>
          <Link href="/" className="mt-5 glass rounded-lg px-4 py-2 text-center w-full">Get Started</Link>
          <div className="mt-3 text-sm text-text-secondary min-h-12 flex items-center">Build your reflection habit and track your mood</div>
        </div>

        <div className="glass rounded-2xl p-5 relative flex flex-col neon-edge">
          <div className="absolute top-2 right-3 text-[11px] px-2 py-0.5 rounded-full bg-white/10 inline-flex items-center gap-1"><Star className="h-3 w-3" /> Most Popular</div>
          <div className="text-sm"><span className="bg-gradient-to-r from-[#C58AFF] via-[#B596FF] to-[#8FC8FF] bg-clip-text text-transparent font-medium">Clarity+</span></div>
          <div className="text-2xl font-semibold mt-1">$15<span className="text-base font-normal opacity-80">/mo</span></div>
          <div className="mt-4 text-sm flex-1 divide-y divide-white/5">
            {rows.map((r) => (
              <div key={r.label} className="py-2 grid grid-cols-[110px_1fr] md:grid-cols-[150px_1fr] gap-3 items-start">
                <div className="text-text-secondary">{r.label}</div>
                <div className="min-w-0">{r.plus}</div>
              </div>
            ))}
          </div>
          <Link href="/plan" className="mt-5 neon-edge rounded-lg px-4 py-2 inline-flex items-center justify-center gap-2 w-full">Upgrade Now <ArrowRightCircle className="h-4 w-4" /></Link>
          <div className="mt-3 text-sm text-text-secondary min-h-12 flex items-center">Unlock personalized insights and guided growth tools</div>
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col">
          <div className="text-sm text-text-secondary">Clarity Pro</div>
          <div className="text-2xl font-semibold mt-1">$50<span className="text-base font-normal opacity-80">/mo</span></div>
          <div className="mt-4 text-sm flex-1 divide-y divide-white/5">
            {rows.map((r) => (
              <div key={r.label} className="py-2 grid grid-cols-[110px_1fr] md:grid-cols-[150px_1fr] gap-3 items-start">
                <div className="text-text-secondary">{r.label}</div>
                <div className="min-w-0">{r.pro}</div>
              </div>
            ))}
          </div>
          <a href="#" className="mt-5 glass rounded-lg px-4 py-2 text-center w-full">Coming Soon</a>
          <div className="mt-3 text-sm text-text-secondary min-h-12 flex items-center">Empower your practice with secure, intelligent client management</div>
        </div>
      </div>

      <div className="text-center text-sm text-text-secondary mt-8">
        No ads. No tracking. Cancel anytime. Your data always stays private.
      </div>
    </div>
  )
}
