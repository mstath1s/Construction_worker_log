import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3000

// Enable CORS
app.use(cors())

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'))
    }
  }
})

// Middleware
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Store logs in memory (replace with database in production)
let dailyLogs: any[] = []

// Routes
app.post('/api/logs', upload.array('photos', 5), (req, res) => {
  try {
    const logData = JSON.parse(req.body.data)
    const files = (req.files as Express.Multer.File[]) || []
    
    const log = {
      ...logData,
      photos: files.map(file => `/uploads/${file.filename}`),
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    dailyLogs.push(log)
    res.status(201).json(log)
  } catch (error) {
    res.status(400).json({ error: 'Invalid request data' })
  }
})

app.get('/api/logs', (req, res) => {
  res.json(dailyLogs)
})

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 