CREATE TABLE `credit_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int,
	`amount` int NOT NULL,
	`type` enum('purchase','usage','bonus','refund') NOT NULL,
	`description` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('image','video') NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`intensity` enum('light','medium','heavy') NOT NULL DEFAULT 'medium',
	`originalKey` varchar(512) NOT NULL,
	`originalUrl` varchar(1024) NOT NULL,
	`originalFilename` varchar(255) NOT NULL,
	`originalMimeType` varchar(64) NOT NULL,
	`processedKey` varchar(512),
	`processedUrl` varchar(1024),
	`progress` int NOT NULL DEFAULT 0,
	`creditsUsed` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`processingStartedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 10 NOT NULL;