'use client'

import { useState, type FormEvent } from 'react'
import { PASSWORD_MIN_LENGTH, PHONE_PATTERN_SOURCE } from '@/lib/validation'

export default function SignupForm() {
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSubmitting(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        alert('회원 가입이 완료되었습니다.\n관리자 승인 후 이용할 수 있습니다.')
        form.reset()
      } else {
        alert(data.error || '회원 가입에 실패했습니다.')
      }
    } catch {
      alert('서버에 연결할 수 없습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>회원 가입</h1>

      <label htmlFor="userId">사용자 ID</label>
      <input id="userId" name="userId" type="text" autoComplete="username" required />

      <label htmlFor="password">암호</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        required
      />

      <label htmlFor="name">이름</label>
      <input id="name" name="name" type="text" autoComplete="name" required />

      <label htmlFor="phone">전화번호</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="010-1234-5678"
        pattern={PHONE_PATTERN_SOURCE}
        title="예: 010-1234-5678"
        required
      />

      <button type="submit" disabled={submitting}>
        가입하기
      </button>
    </form>
  )
}
