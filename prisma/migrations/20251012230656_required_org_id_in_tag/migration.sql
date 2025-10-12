/*
  Warnings:

  - Made the column `organization_id` on table `tag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."tag" DROP CONSTRAINT "tag_organization_id_fkey";

-- AlterTable
ALTER TABLE "tag" ALTER COLUMN "organization_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
