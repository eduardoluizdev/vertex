/*
  Warnings:

  - You are about to drop the column `apiKey` on the `integration_configs` table. All the data in the column will be lost.
  - You are about to drop the column `frontendUrl` on the `integration_configs` table. All the data in the column will be lost.
  - Added the required column `name` to the `integration_configs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "integration_configs" DROP COLUMN "apiKey",
DROP COLUMN "frontendUrl",
ADD COLUMN     "config" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL;
