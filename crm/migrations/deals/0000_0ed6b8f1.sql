CREATE TABLE `deals_deal` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` integer NOT NULL,
	`close_date` integer,
	`company` text NOT NULL,
	`contact` text,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deals_lead` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`owner` text NOT NULL,
	`source` text,
	`status` text DEFAULT 'new' NOT NULL
);
