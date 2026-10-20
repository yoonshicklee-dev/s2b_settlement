import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'
import { autoIncrement } from '@/models/Counter'

const customerSchema = new Schema(
  {
    // 1부터 자동으로 매겨지는 고객 번호 (직접 넣지 않는다)
    customerId: { type: Number, required: true, unique: true, immutable: true },
    // 이 고객을 등록한 사용자의 userNo. 사용자는 자기가 등록한 고객만 보고 고칠 수 있다
    ownerUserNo: { type: Number, required: true, immutable: true, index: true },
    name: { type: String, trim: true },
    account: { type: String, trim: true },
    phone: { type: String, trim: true },
    managerName: { type: String, trim: true },
    // 사업자 등록 번호 (예: 123-45-67890)
    businessNumber: { type: String, trim: true },
  },
  { timestamps: true },
)

autoIncrement(customerSchema, 'customerId', 'customers')

export type Customer = InferSchemaType<typeof customerSchema>

export const CustomerModel: Model<Customer> =
  (mongoose.models.Customer as Model<Customer>) ||
  mongoose.model<Customer>('Customer', customerSchema, 'customers')
