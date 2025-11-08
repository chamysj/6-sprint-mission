import * as s from 'superstruct';
import isUuid from 'is-uuid';

const TAGS = ['SPORTS', 'INSTRUMENTS', 'FURNITURE', 'FASHION', 'ELECTRONICS'];

export const CreateProductStruct = s.object({
  name: s.size(s.string(), 1, 60),
  description: s.size(s.string(), 1, 900),
  price: s.min(s.number(), 0),
  tags: s.enums(TAGS),
});

export const IdParamsStruct = s.object({
  id: s.define('Uuid', (value) => isUuid.v4(value)), //v4형식의 uuid 유효성 검증
});

export const PatchProductStruct = s.partial(CreateProductStruct);
