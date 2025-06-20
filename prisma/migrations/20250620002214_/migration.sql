/*
  Warnings:

  - Made the column `name` on table `user_organization` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `user_organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_organization" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;
