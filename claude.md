#S2B 정산 관리(S2B_Settlement 서비스)

##프로젝트 개요

온라인 쇼핑몰을 통하여 유입된 상품 주문을 받아, 발주를 보내고, 거래를 관리하는 시스템

##기술스택
- Next.js 16 (App Router)
- Tailwind CSS
- MongoDB Atlas (클릭 수 저장)
- vercel (배포)

#주요 기능
- 고객 주문서 입력 및 저장 시스템
- 주문서 기반의 발주 내용 관리 시스템
- 거래 완료 시 기간별 정산 시스템

##코드 규칙
- TypeScript 사용
- 컴포넌트는 src/components/ 아래에 작성
- 환경 변수는 .env.local 에 저장(절대 커밋하지 않음)
- .env 파일은 절대 커밋하지 말 것
- 모바일 우선 반응형 디자인