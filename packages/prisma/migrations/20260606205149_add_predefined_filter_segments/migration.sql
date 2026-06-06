-- AlterEnum
ALTER TYPE "FilterSegmentScope" ADD VALUE 'SYSTEM';

-- AlterTable
ALTER TABLE "FilterSegment" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" TEXT;

-- Make userId optional for system segments
ALTER TABLE "FilterSegment" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex for system segments
CREATE INDEX "FilterSegment_scope_tableIdentifier_category_idx" ON "FilterSegment"("scope", "tableIdentifier", "category");