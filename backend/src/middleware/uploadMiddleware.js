// backend/src/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../utils/apiError.js';
import { fileURLToPath } from 'url'; // Needed for __dirname equivalent

// --- Calculate Upload Directory ---
const __filename = fileURLToPath(import.meta.url); // Path to this file
const __dirname = path.dirname(__filename);       // Directory of this file (src/middleware)
// Adjust '..' count based on this file's location relative to project root
const projectRoot = path.resolve(__dirname, '../..');
const UPLOAD_DIR_RELATIVE = 'public/uploads/products'; // Relative to project root
const UPLOAD_DIR_ABSOLUTE = path.join(projectRoot, UPLOAD_DIR_RELATIVE);

// --- Ensure Directory Exists ---
const ensureUploadDirExists = () => {
    if (!fs.existsSync(UPLOAD_DIR_ABSOLUTE)) {
        console.log(`Creating upload directory: ${UPLOAD_DIR_ABSOLUTE}`);
        try {
            fs.mkdirSync(UPLOAD_DIR_ABSOLUTE, { recursive: true });
        } catch (err) {
            console.error("Could not create upload directory!", err);
            // Decide if you want to throw or handle this differently
            throw new Error("Server setup error: Could not create upload directory.");
        }
    }
    return UPLOAD_DIR_ABSOLUTE;
};

const uploadPath = ensureUploadDirExists();

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath); // Use the absolute path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${extension}`);
    }
});

// --- Multer File Filter ---
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        cb(null, true);
    } else {
        // Use ApiError for consistent error handling
        cb(new ApiError('Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.', 400), false);
    }
};

// --- Multer Upload Instance ---
const MAX_FILE_SIZE_MB = 5; // Configure max size in MB
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * MAX_FILE_SIZE_MB
    },
    fileFilter: fileFilter
});

// --- Export Middleware ---
// Use 'images' as the field name expected from the frontend form
const uploadProductImages = upload.array('images', 10); // Allow up to 10 images

export { uploadProductImages, MAX_FILE_SIZE_MB }; // Export max size for error message consistency