// 로그인 없이 보는 화면들 (로그인, 회원 가입): 왼쪽 메뉴 없이 가운데에 폼만 보인다
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="main auth">{children}</main>
}
