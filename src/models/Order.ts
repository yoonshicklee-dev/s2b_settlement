import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'
import { VAT_TYPES } from '@/lib/orderCalc'
import { autoIncrement } from '@/models/Counter'

const orderItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    vatType: { type: String, enum: VAT_TYPES, required: true },
    // 아래 금액은 저장할 때 서버에서 계산한 값 (src/lib/orderCalc.ts)
    supply: { type: Number, required: true }, // 상품가액
    vat: { type: Number, required: true }, // 부가세
    total: { type: Number, required: true }, // 합산 금액
  },
  { _id: false },
)

const orderCustomerSchema = new Schema(
  {
    customerId: { type: Number, required: true },
    name: { type: String, default: '' },
    businessNumber: { type: String, default: '' },
  },
  { _id: false },
)

const orderSchema = new Schema(
  {
    // 1부터 자동으로 매겨지는 주문서 번호 (직접 넣지 않는다)
    orderId: { type: Number, required: true, unique: true, immutable: true },
    // 이 주문서를 작성한 사용자의 userNo. 사용자는 자기가 작성한 주문서만 볼 수 있다
    ownerUserNo: { type: Number, required: true, immutable: true, index: true },
    // 주문한 고객. 나중에 고객 정보가 바뀌어도 주문서에는 작성 당시 값이 남도록 복사해 둔다
    customer: { type: orderCustomerSchema, required: true },
    items: { type: [orderItemSchema], required: true },
    supplyTotal: { type: Number, required: true }, // 상품가액 총액
    vatTotal: { type: Number, required: true }, // 부가세 총액
    grandTotal: { type: Number, required: true }, // 합산 금액 총액
  },
  { timestamps: true },
)

autoIncrement(orderSchema, 'orderId', 'orders')

export type Order = InferSchemaType<typeof orderSchema>

export const OrderModel: Model<Order> =
  (mongoose.models.Order as Model<Order>) || mongoose.model<Order>('Order', orderSchema, 'orders')
