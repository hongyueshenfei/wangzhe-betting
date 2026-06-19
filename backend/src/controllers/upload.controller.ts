import { Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import config from '../config/index';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../types/index';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持 JPEG、PNG、GIF、WebP 格式的图片'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

class UploadController {
  /** POST /api/upload (multipart: file) */
  upload(req: AuthRequest, res: Response, next: NextFunction): void {
    const uploadSingle = upload.single('file');

    uploadSingle(req, res, (err: unknown) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            error(res, '文件大小不能超过 5MB', 400);
            return;
          }
          error(res, err.message, 400);
          return;
        }
        if (err instanceof Error) {
          error(res, err.message, 400);
          return;
        }
        error(res, '文件上传失败', 500);
        return;
      }

      if (!req.file) {
        error(res, '请选择要上传的文件', 400);
        return;
      }

      // Build URL path relative to server root
      const url = `/uploads/${req.file.filename}`;
      success(res, { url, filename: req.file.filename }, 201);
    });
  }
}

export const uploadController = new UploadController();
