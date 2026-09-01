CREATE TABLE `contacts_contact` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`owner` text NOT NULL,
	`phone` text
);
--> statement-breakpoint
CREATE TABLE `contacts_note` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`contact` text NOT NULL
);
