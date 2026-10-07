/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,leaveTypeId]` on the table `LeaveBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `LeaveBalance_employeeId_leaveTypeId_key` ON `LeaveBalance`(`employeeId`, `leaveTypeId`);
