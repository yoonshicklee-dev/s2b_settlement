import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 정적 HTML 페이지(public/)를 확장자 없는 주소로도 열 수 있게 한다
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/signup', destination: '/signup.html' },
    ]
  },
}

export default nextConfig
