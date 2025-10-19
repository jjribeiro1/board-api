-- DropForeignKey
ALTER TABLE "public"."post" DROP CONSTRAINT "post_status_id_fkey";

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "status_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
