ALTER TABLE `Comic` ADD `readingMode` text DEFAULT 'horizontal';--> statement-breakpoint
ALTER TABLE `ReadProgress` DROP COLUMN `readingMode`;