/*
  Warnings:

  - A unique constraint covering the columns `[default_status_id]` on the table `organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "default_status_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "organization_default_status_id_key" ON "organization"("default_status_id");

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_default_status_id_fkey" FOREIGN KEY ("default_status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
