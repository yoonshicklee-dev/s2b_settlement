import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

export const USER_ROLES = ['admin', 'corp', 'user'] as const
export const APPROVAL_STATUSES = ['승인', '미승인'] as const

const userSchema = new Schema(
  {
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

export type User = InferSchemaType<typeof userSchema>

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) || mongoose.model<User>('User', userSchema, 'users')
