import multer, { Multer } from 'multer'
import multerS3 from 'multer-s3'
import { S3Client } from '@aws-sdk/client-s3'
import path from 'path'
import 'dotenv/config'

// Initialize S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: process.env.AWS_REGION,
})

// Check file type
function checkFileType(file: any, cb: any) {
  const filetypes = /jpeg|jpg|png|gif/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Error: Images Only!')
  }
}

// Set up storage engine
const storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME || '',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: 'public-read',
  key: (_req, file, cb) => {
    cb(null, `${Date.now().toString()}-${file.originalname}`)
  },
})

// Multer configuration
const upload: Multer = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (_req: any, file: any, cb: any) => {
    checkFileType(file, cb)
  },
})

export default upload
