/*
  Warnings:

  - The values [BEAUTY] on the enum `Tag` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Tag_new" AS ENUM ('SPORTS', 'INSTRUMENTS', 'FURNITURE', 'FASHION', 'ELECTRONICS');
ALTER TABLE "Product" ALTER COLUMN "tags" TYPE "Tag_new" USING ("tags"::text::"Tag_new");
ALTER TYPE "Tag" RENAME TO "Tag_old";
ALTER TYPE "Tag_new" RENAME TO "Tag";
DROP TYPE "Tag_old";
COMMIT;
