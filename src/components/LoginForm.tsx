'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.get('userId'),
          password: form.get('password'),
          remember: form.get('remember') === 'on',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        router.replace(next)
        router.refresh()
        return // 이동하는 동안 버튼을 다시 켜지 않는다
      }
      alert(data.error || '로그인에 실패했습니다.')
    } catch {
      alert('서버에 연결할 수 없습니다.')
    }
    setSubmitting(false)
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>로그인</h1>

      <label htmlFor="userId">사용자 ID</label>
      <input id="userId" name="userId" type="text" autoComplete="username" required />

      <label htmlFor="password">암호</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />

      <label className="checkbox">
        <input type="checkbox" name="remember" defaultChecked />
        자동 로그인 (30일 동안 로그인 유지)
      </label>

      <button type="submit" disabled={submitting}>
        로그인
      </button>

      <p className="form-footer">
        계정이 없으신가요? <Link href="/signup">회원 가입</Link>
      </p>
    </form>
  )
}
