/*
  Warnings:

  - You are about to drop the column `customerId` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_customerId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "customerId";

-- CreateTable
CREATE TABLE "_CustomerToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomerToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CustomerToService_B_index" ON "_CustomerToService"("B");

-- AddForeignKey
ALTER TABLE "_CustomerToService" ADD CONSTRAINT "_CustomerToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerToService" ADD CONSTRAINT "_CustomerToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
