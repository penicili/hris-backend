-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('admin', 'executive', 'management', 'user') NOT NULL DEFAULT 'user';
