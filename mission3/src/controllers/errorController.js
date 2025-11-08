import { Prisma } from '@prisma/client';
import { StructError } from 'superstruct';

export function errorHandler(err, req, res, next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.sendStatus(404);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(400).send({ message: err.message });
  } else if (err.name === 'StructError' || err instanceof StructError) {
    return res.status(400).send({ message: err.message });
  } else {
    return res.status(500).send({ message: err.message });
  }
}
