// 가입 폼(input pattern)과 API가 같은 규칙을 쓰도록 한 곳에서 정의한다
export const PHONE_PATTERN_SOURCE = '0\\d{1,2}-?\\d{3,4}-?\\d{4}'
export const PHONE_PATTERN = new RegExp(`^${PHONE_PATTERN_SOURCE}$`)

export const PASSWORD_MIN_LENGTH = 8
