ALTER TABLE `banners`
    ADD COLUMN `variant` ENUM('text_cta', 'media_cta', 'image_link') NOT NULL DEFAULT 'text_cta',
    ADD COLUMN `eyebrow` VARCHAR(160) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `primary_cta_label` VARCHAR(120) NULL,
    ADD COLUMN `primary_cta_href` VARCHAR(500) NULL,
    ADD COLUMN `secondary_cta_label` VARCHAR(120) NULL,
    ADD COLUMN `secondary_cta_href` VARCHAR(500) NULL,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;

UPDATE `banners`
SET
  `description` = `subtitle`,
  `primary_cta_label` = `cta_label`,
  `primary_cta_href` = `cta_href`;

ALTER TABLE `banners`
    DROP COLUMN `subtitle`,
    DROP COLUMN `cta_label`,
    DROP COLUMN `cta_href`;

CREATE INDEX `banners_active_sort_order_idx` ON `banners`(`active`, `sort_order`);
