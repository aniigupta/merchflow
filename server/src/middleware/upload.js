import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.js';

// Configuration for local disk storage (can be swapped with S3/Cloudinary storage engine)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to the local uploads directory
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate clean unique filename using UUID + extension
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File validation filter (only images are permitted)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new AppError('Only image uploads are allowed (.jpeg, .jpg, .png, .webp, .gif)', 400), false);
};

// Initialize multer upload object with restrictions (5MB max)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Helper function to map local file paths to static public URLs.
 * If you swap in S3/Cloudinary, update this mapper to return the cloud URL directly.
 */
export const getFileUrl = (req, filename) => {
  if (!filename) return '';
  // e.g. http://localhost:5000/uploads/uuid.png
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

export default upload;
