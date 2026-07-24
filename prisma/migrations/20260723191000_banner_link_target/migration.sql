ALTER TABLE `banners`
    ADD COLUMN `primary_cta_new_tab` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `secondary_cta_new_tab` BOOLEAN NOT NULL DEFAULT false;
