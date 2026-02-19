-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('ALL', 'ACTIVE_CLIENTS', 'INACTIVE_CLIENTS');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "targetAudience" "TargetAudience" NOT NULL DEFAULT 'ALL';
