ALTER TABLE `jobs` MODIFY COLUMN `type` enum('image') NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` DROP COLUMN `durationSeconds`;--> statement-breakpoint
ALTER TABLE `jobs` DROP COLUMN `frameCount`;--> statement-breakpoint
ALTER TABLE `jobs` DROP COLUMN `framesProcessed`;