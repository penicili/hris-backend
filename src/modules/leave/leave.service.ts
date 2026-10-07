import { start } from 'node:repl';
import { env } from '../../config/env';
import type { LeaveApprovalStatus } from '../../generated/prisma/client';
import { Prisma } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';
import { error } from 'node:console';

type leaveInputRequest = {
  employeeId: number;
  startDate: Date;
  endDate: Date;
  leaveTypeCode: string;
  reason: string;
};

const leaveStatusTransitions: Record<LeaveApprovalStatus, LeaveApprovalStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['CANCELLED'],
  REJECTED: [],
  CANCELLED: []
};

const canTransition = (from: LeaveApprovalStatus, to: LeaveApprovalStatus) => {
  return leaveStatusTransitions[from].includes(to);
};

const calculateDays = (startDate: Date, endDate: Date): number => {
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const applyForLeave = async ({
  employeeId,
  startDate,
  endDate,
  leaveTypeCode,
  reason
}: leaveInputRequest) => {
  const days = calculateDays(startDate, endDate);
  const data: Prisma.LeaveRequestCreateInput = {
    startDate,
    endDate,
    days,
    leaveType: {
      connect: {
        code: leaveTypeCode
      }
    },
    employee: {
      connect: {
        id: employeeId
      }
    },
    reason
  };

  return await prisma.leaveRequest.create({ data });
};

export const processLeaveRequest = async (
  leaveRequestId: number,
  statusChange: LeaveApprovalStatus
) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({ where: { id: leaveRequestId } });
  if (!leaveRequest) {
    throw new Error('nantilah');
  }
  const current = leaveRequest.status;
  if (canTransition(current, statusChange)) {
    return await prisma.leaveRequest.update({
      where: {
        id: leaveRequestId
      },
      data: {
        status: statusChange
      }
    });
  } else {
    throw new Error('nantilah diurus');
  }
};
