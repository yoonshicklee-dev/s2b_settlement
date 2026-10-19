import mongoose from 'mongoose'

// 서버리스 환경에서 요청마다 새 연결을 만들지 않도록 연결을 재사용한다
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>
}

export function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.')
  }
  if (!globalForMongoose.mongooseConn) {
    globalForMongoose.mongooseConn = mongoose.connect(uri).catch((err) => {
      globalForMongoose.mongooseConn = undefined
      throw err
    })
  }
  return globalForMongoose.mongooseConn
}
