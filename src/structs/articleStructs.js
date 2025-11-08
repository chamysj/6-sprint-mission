import * as s from 'superstruct';
import isUuid from 'is-uuid';

export const CreateArticle = s.object({
  title: s.size(s.string(), 1, 100),
  content: s.size(s.string(), 1, 1200),
});

export const PatchArticle = s.partial(CreateArticle);
