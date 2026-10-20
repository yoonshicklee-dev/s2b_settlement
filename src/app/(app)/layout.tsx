import Sidebar from '@/components/Sidebar'
import { requireUser } from '@/lib/auth'

// 로그인해야 볼 수 있는 화면들: 왼쪽 메뉴에 로그인한 사용자를 보여 준다
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  return (
    <>
      <Sidebar user={{ name: user.name, userId: user.userId }} />
      <main className="main">{children}</main>
    </>
  )
}
