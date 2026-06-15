const express      = require('express')
const dotenv       = require('dotenv')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const morgan       = require('morgan')
const fileupload   = require('express-fileupload')

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './config/config.env' })
}

const connectDB = require('./config/db')
connectDB()

const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(fileupload({useTempFiles: true, tempFileDir: '/tmp/', limits: { fileSize: 10 * 1024 * 1024 }}))
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/api/auth',       require('./routes/userRoute'))
app.use('/api/news',       require('./routes/newsRoute'))
app.use('/api/categories', require('./routes/categoryRoute'))

app.get('/', (req, res) => res.json({ message: '📰 News API ажиллаж байна!' }))

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`))
