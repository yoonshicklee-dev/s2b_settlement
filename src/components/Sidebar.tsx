'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const MENU = [
  { href: '/', label: '홈' },
  { href: '/signup', label: '회원 가입' },
  { href: '/customers/new', label: '고객 정보 추가' },
  { href: '/customers', label: '고객 정보 보기' },
  { href: '#', label: '주문서 입력' },
  { href: '#', label: '발주 관리' },
  { href: '#', label: '거래 관리' },
  { href: '#', label: '기간별 정산' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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
      </nav>
    </>
  )
}
