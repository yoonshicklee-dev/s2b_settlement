import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'S2B 정산 관리', template: '%s - S2B 정산 관리' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Sidebar />
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
