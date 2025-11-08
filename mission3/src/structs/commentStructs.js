import * as s from 'superstruct';
import isUuid from 'is-uuid';

export const CreateCommentStruct = s.object({
  nickname: s.size(s.string(), 2, 10),
  content: s.size(s.string(), 1, 300),
});

export const PatchCommentStruct = s.partial(CreateCommentStruct);

export const GetCommnetList = s.object({
  id: s.define('Uuid', (value) => isUuid.v4(value)),
  nickname: s.size(s.string(), 2, 10),
  content: s.size(s.string(), 1, 300),
});

export const CommentIdStruct = s.partial(GetCommnetList);
