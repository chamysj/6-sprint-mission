import * as s from 'superstruct';

export const CreateArticleStruct = s.object({
  title: s.size(s.string(), 1, 100),
  content: s.size(s.string(), 1, 1200),
});

export const PatchArticleStruct = s.partial(CreateArticleStruct);
