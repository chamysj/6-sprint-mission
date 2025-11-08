import express from 'express';
import { CreateArticle, PatchArticle } from '../structs/articleStructs.js';
import { assert } from 'superstruct';
import { Prisma, PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.get('/articles', async (req, res) => {});

app.post('/articles', async (req, res) => {
  const data = req.body;
  assert(data, CreateArticle);
  const article = await prisma.article.create({
    data,
  });
  res.status(201).send(article);
});
