import { z } from 'zod';
import { LeaveApprovalStatus } from '../../generated/prisma/client.js';

export const leaveRequestSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  leaveTypeCode: z.string(),
  reason: z.string()
});

export const newLeaveRequestSchema = leaveRequestSchema;

export const updateLeaveRequestSchema = leaveRequestSchema.partial();

export const processLeaveStatusSchema = z.object({
  id: z.int(),
  statusChange: z.enum(LeaveApprovalStatus)
})