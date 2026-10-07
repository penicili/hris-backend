import { start } from 'node:repl';
import { env } from '../../config/env';
import type { LeaveApprovalStatus } from '../../generated/prisma/client';
import { Prisma } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';
import { error } from 'node:console';
import { DatabaseSync } from 'node:sqlite';

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
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
    // TODO: global error middlewer
    throw new Error('nantilah');
  }
  const current = leaveRequest.status;

  // else
  if (canTransition(current, statusChange)) {
    const updated = await prisma.leaveRequest.update({
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
  // Kalau approved terus cancel, balikin jatahnya
  const days = leaveRequest.days;
  
  if (leaveRequest.status == 'APPROVED' && statusChange == 'CANCELLED') {
    await changeLeaveBalance(days, leaveRequest.employeeId, leaveRequest.leaveTypeId);
  } else if (leaveRequest.status == 'PENDING' && statusChange == 'APPROVED'){
    await changeLeaveBalance(-days, leaveRequest.employeeId, leaveRequest.leaveTypeId);
  }
};

const changeLeaveBalance = async (delta: number, employeeId: number, leaveTypeId: number) => {
  const updatedBalance = await prisma.leaveBalance.update({
    where: {employeeId_leaveTypeId:{
      employeeId, leaveTypeId
    }}, data:{
      used: {
        increment: delta
      }
    }} 
  );
};
