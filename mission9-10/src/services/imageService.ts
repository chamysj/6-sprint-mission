import { uploadImageResponse } from '../../types/image';
import { BadRequestError } from '../lib/errors/customErrors';
import path from 'path';
import { STATIC_PATH } from '../lib/constants';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { MulterRequest } from '../../types/multer';

export class ImageService {
  s3: S3Client | null;
  constructor() {
    if (process.env.UPLOAD_PROVIDER === 's3') {
      this.s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
        },
      });
    } else {
      this.s3 = null;
    }
  }

  async buildImageUrl(req: MulterRequest): Promise<uploadImageResponse> {
    if (process.env.UPLOAD_PROVIDER === 's3') {
      return await this.buildImageUrlFromS3(req);
    }
    return this.buildImageUrlFromLocal(req);
  }

  // 로컬 : static URL 생성
  buildImageUrlFromLocal(req: MulterRequest): uploadImageResponse {
    const host = req.get('host');
    if (!host) {
      throw new BadRequestError('요청 헤더에 host 정보가 없습니다.');
    }

    if (!req.file?.filename) {
      throw new BadRequestError('업로드된 파일이 없습니다.');
    }

    const baseUrl = `${req.protocol}://${host}`;
    const url = `${baseUrl}/${STATIC_PATH}/${req.file.filename}`;
    return { url };
  }

  // 프로덕션 : 업로드하고 S3 URL 반환
  async buildImageUrlFromS3(req: MulterRequest): Promise<uploadImageResponse> {
    if (!this.s3) {
      throw new BadRequestError('S3 설정이 없습니다.');
    }

    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;

    if (!bucket || !region) {
      throw new BadRequestError('S3 환경 변수가 없습니다.');
    }

    if (!req.file?.buffer || !req.file.originalname) {
      throw new BadRequestError('S3 업로드용 파일이 없습니다.');
    }

    const ext = path.extname(req.file.originalname);
    //s3에 uploads 폴더를 만들어서 그 안에 파일들이 들어가도록 설정
    const key = `uploads/${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype ?? 'application/octet-stream',
      }),
    );

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return { url };
  }
}

export const imageService = new ImageService();
