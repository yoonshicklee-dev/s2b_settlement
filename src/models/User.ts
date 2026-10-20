import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'
import { autoIncrement } from '@/models/Counter'

export const USER_ROLES = ['admin', 'corp', 'user'] as const
export const APPROVAL_STATUSES = ['승인', '미승인'] as const

const userSchema = new Schema(
  {
    // 1부터 자동으로 매겨지는 사용자 번호 (직접 넣지 않는다). 로그인 ID인 userId와는 다르다
    userNo: { type: Number, required: true, unique: true, immutable: true },
    userId: { type: String, required: true, unique: true, trim: true },
    // bcrypt 해시만 저장한다 (원래 암호로 되돌릴 수 없음)
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: USER_ROLES, required: true, default: 'user' },
    approval: { type: String, enum: APPROVAL_STATUSES, required: true, default: '미승인' },
  },
  { timestamps: true },
)

autoIncrement(userSchema, 'userNo', 'users')

export type User = InferSchemaType<typeof userSchema>

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) || mongoose.model<User>('User', userSchema, 'users')
