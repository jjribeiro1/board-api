-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- AlterTable
ALTER TABLE "organization_invite" ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';
