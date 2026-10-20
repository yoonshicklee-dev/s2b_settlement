import Link from 'next/link'

const WINDOW = 5 // 한 번에 보여 줄 페이지 번호 개수

export default function Pagination({ current, totalPages }: { current: number; totalPages: number }) {
  if (totalPages <= 1) return null

  // 현재 페이지가 가운데 오도록 번호 범위를 잡는다
  const start = Math.max(1, Math.min(current - Math.floor(WINDOW / 2), totalPages - WINDOW + 1))
  const pages = Array.from({ length: Math.min(WINDOW, totalPages) }, (_, i) => start + i)
  const href = (page: number) => `?page=${page}`

  return (
    <nav className="pagination" aria-label="페이지 이동">
      {current > 1 ? <Link href={href(current - 1)}>이전</Link> : <span className="disabled">이전</span>}
      {pages.map((page) =>
        page === current ? (
          <span key={page} className="current" aria-current="page">
            {page}
          </span>
        ) : (
          <Link key={page} href={href(page)}>
            {page}
          </Link>
        ),
      )}
      {current < totalPages ? (
        <Link href={href(current + 1)}>다음</Link>
      ) : (
        <span className="disabled">다음</span>
      )}
    </nav>
  )
}
