const mongoose = require('mongoose')
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    console.log('MONGO_URI:', uri ? 'байна ✅' : 'байхгүй ❌')
    const conn = await mongoose.connect(uri)
    console.log(`✅ MongoDB холбогдлоо: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB алдаа: ${error.message}`)
    process.exit(1)
  }
}
module.exports = connectDB
