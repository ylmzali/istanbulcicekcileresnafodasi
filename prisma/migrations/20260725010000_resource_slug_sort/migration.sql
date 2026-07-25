-- AlterTable
ALTER TABLE `resources`
  ADD COLUMN `slug` VARCHAR(180) NULL,
  ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;

UPDATE `resources`
SET `slug` = CONCAT('kaynak-', `id`)
WHERE `slug` IS NULL OR `slug` = '';

ALTER TABLE `resources`
  MODIFY COLUMN `slug` VARCHAR(180) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `resources_slug_key` ON `resources`(`slug`);

-- CreateIndex
CREATE INDEX `resources_sort_order_idx` ON `resources`(`sort_order`);
