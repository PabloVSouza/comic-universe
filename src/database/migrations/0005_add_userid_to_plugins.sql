CREATE TABLE `Plugin_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`logo` text,
	`tag` text NOT NULL,
	`description` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `Plugin_new` (`id`, `userId`, `enabled`, `name`, `url`, `logo`, `tag`, `description`)
SELECT 
	`id`,
	COALESCE((SELECT `id` FROM `User` WHERE `default` = 1 LIMIT 1), (SELECT `id` FROM `User` LIMIT 1), ''),
	`enabled`,
	`name`,
	`url`,
	`logo`,
	`tag`,
	`description`
FROM `Plugin`
WHERE EXISTS (SELECT 1 FROM `Plugin`);
--> statement-breakpoint
DROP TABLE `Plugin`;
--> statement-breakpoint
ALTER TABLE `Plugin_new` RENAME TO `Plugin`;

