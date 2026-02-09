import multer from 'multer';
import path from 'path/win32';
import { PUBLIC_PATH } from '../lib/constants';
import { BadRequestError } from '../lib/errors/customErrors';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
const uploadProvider = process.env.UPLOAD_PROVIDER ?? 'local';

function fileFilter(req: any, file: any, cb: any) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new BadRequestError('Only png, jpeg, and jpg are allowed'));
  }
  cb(null, true);
}

function makeFilename(originalname: string) {
  const ext = path.extname(originalname);
  return `${uuidv4()}${ext}`;
}

// local: 디스크 저장
const localUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, PUBLIC_PATH);
    },
    filename(req, file, cb) {
      cb(null, makeFilename(file.originalname));
    },
  }),
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
});

// s3: memoryStorage (S3로 업로드는 서비스에서 처리)
const s3Upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
});

export const upload = uploadProvider === 's3' ? s3Upload : localUpload;
