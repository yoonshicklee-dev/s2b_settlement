import { NextResponse, type NextRequest } from 'next/server'
import { decryptSession, SESSION_COOKIE } from '@/lib/sessionToken'

// 로그인 없이 열 수 있는 주소
const PUBLIC_PAGES = ['/login', '/signup']
const PUBLIC_APIS = ['/api/auth/login', '/api/signup']

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const user = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value)

  if (PUBLIC_PAGES.includes(pathname)) {
    // 이미 로그인했으면 로그인/회원 가입 화면 대신 홈으로 보낸다
    return user ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next()
  }
  if (user || PUBLIC_APIS.includes(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  // 로그인한 뒤 원래 보려던 화면으로 돌아오도록 주소를 넘긴다
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', pathname + search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // 정적 파일과 이미지는 검사하지 않는다
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
}
