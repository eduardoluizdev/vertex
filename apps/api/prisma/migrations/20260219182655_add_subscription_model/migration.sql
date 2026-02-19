/*
  Warnings:

  - You are about to drop the `_CustomerToService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CustomerToService" DROP CONSTRAINT "_CustomerToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_CustomerToService" DROP CONSTRAINT "_CustomerToService_B_fkey";

-- DropTable
DROP TABLE "_CustomerToService";

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "recurrenceDay" INTEGER NOT NULL,
    "recurrenceMonth" INTEGER,
    "customerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_customerId_serviceId_key" ON "Subscription"("customerId", "serviceId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
