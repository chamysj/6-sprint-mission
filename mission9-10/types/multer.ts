import { Request } from 'express';

export type MulterRequest = Request & {
  file?: {
    filename?: string;
    buffer?: Buffer;
    originalname?: string;
    mimetype?: string;
  };
};
