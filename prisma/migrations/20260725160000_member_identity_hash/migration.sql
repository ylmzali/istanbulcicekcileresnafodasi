-- AlterTable
ALTER TABLE `members` ADD COLUMN `identity_no_hash` VARCHAR(128) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `members_identity_no_hash_key` ON `members`(`identity_no_hash`);
