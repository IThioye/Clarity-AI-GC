// Splash page uses the static PNG brand logo
import Link from 'next/link'

export default function MarketingPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <img src="/brand/logo.png" alt="Clarity AI" className="w-[260px] h-[260px] md:w-[320px] md:h-[320px] object-contain" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Your Cognitive Companion for Clarity</h1>
        <p className="text-text-secondary">Privacy-first • End-to-End Encrypted</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/get-started" className="px-5 py-3 rounded-lg glass neon-edge focus-ring">Get Started</Link>
          <Link href="/signin" className="px-5 py-3 rounded-lg border border-white/15 focus-ring">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
