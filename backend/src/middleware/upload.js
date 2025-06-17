import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedBaseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('File filter - File type:', file.mimetype);
  console.log('File filter - Original name:', file.originalname);
  
  // Allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];
  
  const allowedExtensions = /\.(jpg|jpeg|png|pdf)$/i;
  
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype.toLowerCase());

  if (mimetype && extname) {
    console.log('File filter - File accepted');
    return cb(null, true);
  } else {
    console.log('File filter - File rejected');
    const error = new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only allow 1 file per upload
  },
  fileFilter: fileFilter
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only 1 file allowed per upload.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "document" as the field name.'
      });
    }
  }
  
  if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Export both upload middleware and error handler
export default upload;
export { handleMulterError };