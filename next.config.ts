import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 예전 정적 HTML 주소로 들어와도 새 페이지로 보낸다
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/signup.html', destination: '/signup', permanent: true },
    ]
  },
}

export default nextConfig
