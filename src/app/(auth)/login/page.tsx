import type { Metadata } from 'next'
import LoginForm from '@/components/LoginForm'

export const metadata: Metadata = { title: '로그인' }

type Props = { searchParams: Promise<{ next?: string | string[] }> }

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams
  const target = Array.isArray(next) ? next[0] : next
  // 다른 사이트로 보내는 주소(//evil.com 등)는 받지 않는다
  const safeNext = target?.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\') ? target : '/'
  return <LoginForm next={safeNext} />
}
