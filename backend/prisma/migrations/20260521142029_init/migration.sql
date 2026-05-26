-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'AWAITING_VALIDATION', 'PROCESSED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('REFUND', 'DELIVERY_ISSUE', 'TECHNICAL', 'BILLING', 'OTHER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'SUPPORT');

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "gmailId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "aiSummary" TEXT,
    "aiReply" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "sentReply" TEXT,
    "exportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Email_gmailId_key" ON "Email"("gmailId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
