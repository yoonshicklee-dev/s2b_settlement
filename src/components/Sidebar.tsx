'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const MENU = [
  { href: '/', label: '홈' },
  { href: '/customers/new', label: '고객 정보 추가' },
  { href: '/customers', label: '고객 정보 보기' },
  { href: '#', label: '주문서 입력' },
  { href: '#', label: '발주 관리' },
  { href: '#', label: '거래 관리' },
  { href: '#', label: '기간별 정산' },
]

type Props = { user: { name: string; userId: string } }

export default function Sidebar({ user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      <button className="menu-btn" aria-label="메뉴 열기" onClick={() => setOpen((o) => !o)}>
        ☰
      </button>

      <nav className={open ? 'sidebar open' : 'sidebar'}>
        <h2>S2B 정산 관리</h2>
        {MENU.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={item.href === pathname ? 'active' : undefined}
            // 모바일에서 메뉴를 고르면 닫는다 (페이지 이동 시 새로 고침되지 않으므로)
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}

        <div className="sidebar-user">
          <span>
            {user.name} <small>({user.userId})</small>
          </span>
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </nav>
    </>
  )
}
