-- CreateEnum
CREATE TYPE "LeadKanbanStage" AS ENUM ('NOVO', 'CONTATO_INICIAL', 'INTERESSADO', 'PROPOSTA_ENVIADA', 'EM_NEGOCIACAO', 'CLIENTE', 'PERDIDO');

-- CreateEnum
CREATE TYPE "LeadListStatus" AS ENUM ('PROCESSANDO', 'CONCLUIDO', 'FALHA');

-- CreateTable
CREATE TABLE "lead_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nicho" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "status" "LeadListStatus" NOT NULL DEFAULT 'PROCESSANDO',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "leadListId" TEXT NOT NULL,
    "stage" "LeadKanbanStage" NOT NULL DEFAULT 'NOVO',
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "category" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lead_lists" ADD CONSTRAINT "lead_lists_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_leadListId_fkey" FOREIGN KEY ("leadListId") REFERENCES "lead_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
