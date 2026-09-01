CREATE TABLE `activities_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`contact` text NOT NULL,
	`deal` text,
	`due` integer,
	`kind` text NOT NULL,
	`owner` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `activities_task` (
	`id` text PRIMARY KEY NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`due` integer,
	`owner` text NOT NULL,
	`title` text NOT NULL
);
