import '../styles/globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { Navbar } from '../components/Navbar'
import ThemeSync from '../components/ThemeSync'

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400','500','700'] })
const inter = Inter({ subsets: ['latin'], weight: ['400','500'] })

export const metadata: Metadata = {
  title: 'Clarity AI',
  description: 'Your Cognitive Companion for Clarity',
  icons: {
    icon: '/brand/clara.png',
    apple: '/brand/clara.png',
    shortcut: '/brand/clara.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.className} bg-[var(--bg-deep)] text-text-primary`}>
        <div className={`${inter.className}`}>
          <ThemeSync />
          {/* Global corner accents */}
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-24 -right-16 w-[60vw] h-[60vw] max-w-[900px] rounded-full blur-3xl opacity-30"
                 style={{ background: 'radial-gradient(35% 35% at 70% 30%, var(--acc-blue) 0%, transparent 70%), radial-gradient(35% 35% at 30% 70%, var(--acc-rose) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-24 -left-16 w-[60vw] h-[60vw] max-w-[900px] rounded-full blur-3xl opacity-25"
                 style={{ background: 'radial-gradient(35% 35% at 30% 30%, var(--acc-violet) 0%, transparent 70%), radial-gradient(35% 35% at 70% 70%, var(--acc-blue) 0%, transparent 70%)' }} />
          </div>
          <Navbar />
          <main className="max-w-[1200px] mx-auto px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  )
}
