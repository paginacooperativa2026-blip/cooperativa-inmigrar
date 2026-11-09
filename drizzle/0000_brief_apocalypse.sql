CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`name` text NOT NULL,
	`person` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`price` text,
	`whatsapp` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`email` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`role` text DEFAULT 'member' NOT NULL
);
