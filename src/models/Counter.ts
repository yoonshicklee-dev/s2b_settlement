import mongoose, { Schema, type Document, type Model } from 'mongoose'

// MongoDB에는 Auto Increment가 없어서, 컬렉션별 마지막 번호를 여기에 저장해 두고 하나씩 올린다
const counterSchema = new Schema({
  _id: { type: String, required: true }, // 번호를 매길 대상 이름 (예: 'customers')
  seq: { type: Number, required: true, default: 0 },
})

type Counter = { _id: string; seq: number }

export const CounterModel: Model<Counter> =
  (mongoose.models.Counter as Model<Counter>) ||
  mongoose.model<Counter>('Counter', counterSchema, 'counters')

// 원자적으로 1 증가시킨 값을 돌려주므로 동시에 여러 건이 들어와도 번호가 겹치지 않는다
export async function nextSequence(name: string) {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true },
  )
  return counter.seq
}

// 새 문서를 저장할 때 field에 다음 번호를 붙인다
// required 검사보다 먼저 번호를 붙여야 하므로 save가 아닌 validate 단계에서 실행한다
export function autoIncrement(schema: Schema, field: string, counterName: string) {
  schema.pre('validate', async function (this: Document) {
    if (this.isNew && this.get(field) == null) {
      this.set(field, await nextSequence(counterName))
    }
  })
}
