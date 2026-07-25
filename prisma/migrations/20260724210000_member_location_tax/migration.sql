-- AlterTable
ALTER TABLE `member_profiles`
  ADD COLUMN `country_code` VARCHAR(2) NOT NULL DEFAULT 'TR';

-- AlterTable
ALTER TABLE `businesses`
  ADD COLUMN `country_code` VARCHAR(2) NOT NULL DEFAULT 'TR';
