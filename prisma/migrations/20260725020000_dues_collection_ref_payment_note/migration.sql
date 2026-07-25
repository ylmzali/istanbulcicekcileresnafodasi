-- AlterTable
ALTER TABLE `members`
  ADD COLUMN `collection_ref` VARCHAR(80) NULL;

-- AlterTable
ALTER TABLE `payments`
  ADD COLUMN `note` VARCHAR(500) NULL;
