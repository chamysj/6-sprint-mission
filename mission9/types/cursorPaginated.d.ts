export type CursorPaginated<T> = {
  list: T[];
  nextCursor: number | null;
};
