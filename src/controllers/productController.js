import express from 'express';
import { CreateProduct, PatchProduct } from '../structs/productStructs.js';
import { Prisma, PrismaClient } from '@prisma/client';
import { assert } from 'superstruct';

const app = express();
const prisma = new PrismaClient();

app.post('/products', async (req, res) => {
  const data = req.body;
  assert(data, CreateProduct);
  const product = await prisma.product.create({
    data,
  });
  res.status(201).send(product);
});

app.get('/products/:id', async (req, res) => {
  const data = req.body;
  assert(data);
});
