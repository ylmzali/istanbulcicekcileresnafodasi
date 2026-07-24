-- AlterTable
ALTER TABLE `events` ADD COLUMN `featured` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `events` ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `events_featured_sort_order_idx` ON `events`(`featured`, `sort_order`);
