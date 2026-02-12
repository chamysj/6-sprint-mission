import {
  coerce,
  partial,
  object,
  string,
  min,
  nonempty,
  array,
  integer,
  optional,
} from 'superstruct';
import { PageParamsStruct } from './commonStructs';

export const CreateProductBodyStruct = object({
  name: coerce(nonempty(string()), string(), (value) => value.trim()),
  description: nonempty(string()),
  price: min(integer(), 0),
  tags: optional(array(string())),
  images: optional(array(string())),
});

export const GetProductListParamsStruct = PageParamsStruct;

export const UpdateProductBodyStruct = partial(CreateProductBodyStruct);

export const LikeProductParamsStruct = PageParamsStruct;
