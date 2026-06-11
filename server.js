const express      = require('express')
const dotenv       = require('dotenv')
const cors         = require('cors')
const path         = require('path')
const fs           = require('fs')
const cookieParser = require('cookie-parser')
const morgan       = require('morgan')
const fileupload   = require('express-fileupload')

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './config/config.env' })
}

const connectDB = require('./config/db')
connectDB()

const app = express()

const uploadDir = path.join(__dirname, 'data/uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(fileupload({limits: { fileSize: 50 * 1024 * 1024 }, useTempFiles: true, tempFileDir: '/tmp/'}))
app.use(cookieParser())
app.use(morgan('dev'))
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')))

app.use('/api/auth',       require('./routes/userRoute'))
app.use('/api/news',       require('./routes/newsRoute'))
app.use('/api/categories', require('./routes/categoryRoute'))

app.get('/', (req, res) => res.json({ message: '📰 News API ажиллаж байна!' }))

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`))
