CREATE TABLE `Chapter` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comicId` integer NOT NULL,
	`siteId` text NOT NULL,
	`siteLink` text,
	`releaseId` text,
	`repo` text NOT NULL,
	`name` text,
	`number` text NOT NULL,
	`pages` text,
	`date` text,
	`offline` integer DEFAULT false NOT NULL,
	`language` text,
	FOREIGN KEY (`comicId`) REFERENCES `Comic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Comic` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`siteId` text NOT NULL,
	`name` text NOT NULL,
	`cover` text NOT NULL,
	`repo` text NOT NULL,
	`author` text,
	`artist` text,
	`publisher` text,
	`status` text,
	`genres` text,
	`siteLink` text,
	`year` text,
	`synopsis` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Plugin` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`repository` text NOT NULL,
	`version` text NOT NULL,
	`path` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ReadProgress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chapterId` integer NOT NULL,
	`comicId` integer NOT NULL,
	`userId` integer NOT NULL,
	`totalPages` integer NOT NULL,
	`page` integer NOT NULL,
	FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`comicId`) REFERENCES `Comic`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`default` integer DEFAULT false NOT NULL,
	`settings` text DEFAULT '{}'
);
