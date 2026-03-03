/*
  Warnings:

  - Made the column `organization_id` on table `notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "notification" ALTER COLUMN "organization_id" SET NOT NULL;
