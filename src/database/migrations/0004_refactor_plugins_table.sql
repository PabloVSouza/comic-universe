CREATE TABLE `Plugin_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`logo` text,
	`tag` text NOT NULL,
	`description` text
);
--> statement-breakpoint
INSERT INTO `Plugin_new` (`id`, `enabled`, `name`, `url`, `tag`)
SELECT `id`, `enabled`, `name`, COALESCE(`repository`, ''), COALESCE(`name` || '_' || `id`, 'plugin_' || `id`)
FROM `Plugin`
WHERE EXISTS (SELECT 1 FROM `Plugin`);
--> statement-breakpoint
DROP TABLE `Plugin`;
--> statement-breakpoint
ALTER TABLE `Plugin_new` RENAME TO `Plugin`;

