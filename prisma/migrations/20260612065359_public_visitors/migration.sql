/*
  Warnings:

  - You are about to drop the column `liked` on the `Media` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Media_liked_idx` ON `Media`;

-- AlterTable
ALTER TABLE `Media` DROP COLUMN `liked`;

-- AlterTable
ALTER TABLE `PlayHistory` ADD COLUMN `visitorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Playlist` ADD COLUMN `visitorId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Like` (
    `visitorId` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Like_visitorId_idx`(`visitorId`),
    PRIMARY KEY (`visitorId`, `mediaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PlayHistory_visitorId_idx` ON `PlayHistory`(`visitorId`);

-- CreateIndex
CREATE INDEX `Playlist_visitorId_idx` ON `Playlist`(`visitorId`);

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
