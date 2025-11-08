import express from 'express';
import { CreateProduct } from './structs/productStructs.js';
import { assert } from 'superstruct';
import { Prisma, PrismaClient } from '@prisma/client';
import cors from 'cors';
import { CreateArticle } from './structs/articleStructs.js';

const PORT = 3000;
const app = express();

//컨트롤러로 이동 예정
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.get('/products', (req, res) => {
  res.send('Hello Express');
});

app.post('/products', async (req, res) => {
  const data = req.body;
  assert(data, CreateProduct);
  const product = await prisma.product.create({
    data,
  });
  res.status(201).send(product);
});

app.post('/articles', async (req, res) => {
  const data = req.body;
  assert(data, CreateArticle);
  const article = await prisma.article.create({
    data,
  });
  res.status(201).send(article);
});

//------------------------------------------------

app.listen(PORT, () => {
  console.log('Server Started');
});
