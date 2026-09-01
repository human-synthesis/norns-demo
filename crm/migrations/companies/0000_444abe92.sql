CREATE TABLE `companies_company` (
	`id` text PRIMARY KEY NOT NULL,
	`domain` text,
	`industry` text,
	`name` text NOT NULL,
	`owner` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `companies_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_tag_label_unique` ON `companies_tag` (`label`);