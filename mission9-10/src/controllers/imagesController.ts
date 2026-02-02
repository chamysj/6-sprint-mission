import { Request, Response } from 'express';
import { imageService } from '../services/imageService';

export async function uploadImage(req: Request, res: Response) {
  const response = await imageService.buildImageUrl(req);
  return res.send(response);
}
