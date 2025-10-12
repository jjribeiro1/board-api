/*
  Warnings:

  - You are about to drop the column `is_system_default` on the `tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tag" DROP COLUMN "is_system_default";
