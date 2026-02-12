import { uploadImageResponse } from '../../types/image';
import { Request } from 'express';
import { BadRequestError } from '../lib/errors/customErrors';
import path from 'path';
import { STATIC_PATH } from '../lib/constants';

export class ImageService {
  buildImageUrl(req: Request): uploadImageResponse {
    const host = req.get('host');
    if (!host) {
      throw new BadRequestError('요청 헤더에 host 정보가 없습니다.');
    }
    if (!req.file) {
      throw new BadRequestError();
    }
    const filePath = path.join(host, STATIC_PATH, req.file.filename);
    const url = `http://${filePath}`;
    return { url };
  }
}

export const imageService = new ImageService();
