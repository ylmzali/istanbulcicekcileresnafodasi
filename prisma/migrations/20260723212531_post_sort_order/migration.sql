-- DropIndex
DROP INDEX `posts_featured_idx` ON `posts`;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `posts_featured_sort_order_idx` ON `posts`(`featured`, `sort_order`);
