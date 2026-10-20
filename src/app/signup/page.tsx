import type { Metadata } from 'next'
import SignupForm from '@/components/SignupForm'

export const metadata: Metadata = { title: '회원 가입' }

export default function SignupPage() {
  return <SignupForm />
}
