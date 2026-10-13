import type { Request, Response } from 'express';
import {
  processLeaveStatusSchema,
  updateLeaveRequestSchema,
  newLeaveRequestSchema
} from './leave.schema';
import type { ValidatedRequest } from '../../middlewares/validate.js';
import { applyForLeave, processLeaveRequest, updateLeaveReqDetails } from './leave.service.js';
import { AppError } from '../../errors/app-error.js';
import prisma from '../../lib/prisma.js';

export const applyLeaveController = async (
  req: ValidatedRequest<typeof newLeaveRequestSchema>,
  res: Response
) => {
  const employeeId = req.user?.userId;
  if (!employeeId) {
    throw new AppError(401, 'ACCESS_DENIED', 'Employee not found');
  }
  const { startDate, endDate, leaveTypeCode, reason } = req.body;

  const data = await applyForLeave({ employeeId, startDate, endDate, leaveTypeCode, reason });

  res.status(200).json({
    status: 'success',
    data: data
  });
};

export const updateLeaveController = async (
  req: ValidatedRequest<typeof updateLeaveRequestSchema>,
  res: Response
) => {
  const employeeId = req.user?.userId;
  if (!employeeId) {
    throw new AppError(401, 'ACCESS_DENIED', 'Employee not found');
  }

  const { reqId, endDate, leaveTypeCode, startDate, reason, status } = req.body;
  const data = await updateLeaveReqDetails({
    reqId,
    employeeId,
    endDate,
    leaveTypeCode,
    startDate,
    reason,
    status
  });

  res.status(200).json({
    status: 'success',
    data: data
  })
};

export const processLeaveRequestController = async (
  req: ValidatedRequest<typeof processLeaveStatusSchema>,
  res: Response
) => {
  const {id, statusChange} = req.body
  const data = await processLeaveRequest(id, statusChange)

  res.status(200).json({
    status: 'success',
    data: data
  })

};
