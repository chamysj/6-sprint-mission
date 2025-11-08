import * as s from 'superstruct';
import isEmail from 'is-email';
import isUuid from 'is-uuid';

const TAGS = ['SPORTS', 'INSTRUMENTS', 'FURNITURE', 'FASHION', 'ELECTRONICS'];

export const CreateProduct = s.object({
  name: s.size(s.string(), 1, 60),
  description: s.size(s.string(), 1, 900),
  price: s.min(s.number(), 0),
  tags: s.enums(TAGS),
});

export const PatchProduct = s.partial(CreateProduct);
