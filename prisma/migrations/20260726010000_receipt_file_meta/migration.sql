-- AlterTable
ALTER TABLE `receipts`
  ADD COLUMN `original_filename` VARCHAR(255) NULL,
  ADD COLUMN `mime_type` VARCHAR(120) NULL,
  ADD COLUMN `file_size` INTEGER NULL;
