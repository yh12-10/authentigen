DROP TABLE `credit_transactions`;--> statement-breakpoint
ALTER TABLE `jobs` DROP COLUMN `creditsUsed`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `credits`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `bonusClaimed`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `stripeCustomerId`;