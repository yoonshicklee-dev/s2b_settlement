// 로그를 보지 않아도 원인을 알 수 있도록 오류 종류만 알려 준다 (상세 내용은 노출하지 않음)
export function describeDbError(err: unknown) {
  const e = err as { name?: string; code?: number; message?: string }
  if (e.message?.includes('MONGODB_URI')) {
    return '저장 중 오류가 발생했습니다. (서버에 DB 주소가 설정되지 않음)'
  }
  if (e.code === 18 || e.code === 8000 || /auth/i.test(e.message ?? '')) {
    return '저장 중 오류가 발생했습니다. (DB 인증 실패)'
  }
  if (e.name === 'MongooseServerSelectionError' || e.name === 'MongoServerSelectionError') {
    return '저장 중 오류가 발생했습니다. (DB 서버에 연결할 수 없음)'
  }
  return '저장 중 오류가 발생했습니다.'
}
