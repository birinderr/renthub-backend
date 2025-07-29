import multer from 'multer';
import { storage } from '../configs/cloudinary.js';

const upload = multer({ storage });

export default upload;
