CREATE TABLE `Changelog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`entityType` text NOT NULL,
	`entityId` text NOT NULL,
	`action` text NOT NULL,
	`data` text,
	`createdAt` text,
	`synced` integer DEFAULT false,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
