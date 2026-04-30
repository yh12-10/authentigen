ALTER TABLE `credit_transactions` ADD `stripeSessionId` varchar(128);--> statement-breakpoint
ALTER TABLE `jobs` ADD `batchId` varchar(36);--> statement-breakpoint
ALTER TABLE `jobs` ADD `durationSeconds` float;--> statement-breakpoint
ALTER TABLE `jobs` ADD `frameCount` int;--> statement-breakpoint
ALTER TABLE `jobs` ADD `framesProcessed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `credit_transactions` ADD CONSTRAINT `credit_tx_stripe_session_unique` UNIQUE(`stripeSessionId`);--> statement-breakpoint
CREATE INDEX `jobs_batchId_idx` ON `jobs` (`batchId`);