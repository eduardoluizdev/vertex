-- AlterEnum: Add new proposal trigger categories
ALTER TYPE "WhatsappTemplateCategory" ADD VALUE 'PROPOSTA_CRIADA';
ALTER TYPE "WhatsappTemplateCategory" ADD VALUE 'PROPOSTA_ACEITA';

-- Migrate existing PROPOSTA rows to PROPOSTA_CRIADA
UPDATE "whatsapp_templates" SET "category" = 'PROPOSTA_CRIADA' WHERE "category" = 'PROPOSTA';
