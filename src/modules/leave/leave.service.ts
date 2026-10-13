import { AppError } from '../../errors/app-error';
import type { LeaveApprovalStatus } from '../../generated/prisma/client';
import { Prisma } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';

type leaveInputRequest = {
  employeeId: number;
  startDate: Date;
  endDate: Date;
  leaveTypeCode: string;
  reason: string;
};

type leaveUpdateInputRequest = {
  reqId: number;
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
  leaveTypeCode?: string;
  reason?: string;
  status?: LeaveApprovalStatus;
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

const getBalanceDelta = (
  currentStatus: LeaveApprovalStatus,
  nextStatus: LeaveApprovalStatus,
  currentDays: number,
  nextDays: number
) => {
  if (currentStatus === 'PENDING' && nextStatus === 'APPROVED') {
    return -nextDays;
  }

  if (currentStatus === 'APPROVED' && nextStatus === 'CANCELLED') {
    return currentDays;
  }

  if (currentStatus === 'APPROVED' && nextStatus === 'APPROVED') {
    return nextDays - currentDays;
  }

  return 0;
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

const changeLeaveBalance = async (
  tx: Prisma.TransactionClient,
  delta: number,
  employeeId: number,
  leaveTypeId: number
) => {
  return tx.leaveBalance.update({
    where: {
      employeeId_leaveTypeId: {
        employeeId,
        leaveTypeId
      }
    },
    data: {
      used: {
        increment: delta
      }
    }
  });
};

export const updateLeaveRequest = async ({
  reqId,
  employeeId,
  startDate,
  endDate,
  leaveTypeCode,
  reason,
  status
}: leaveUpdateInputRequest) => {
  return prisma.$transaction(async (tx) => {
    const current = await tx.leaveRequest.findUniqueOrThrow({
      where: { id: reqId }
    });

    const nextStatus = status ?? current.status;
    if (status !== undefined && !canTransition(current.status, nextStatus)) {
      throw new AppError(400, "INVALID TRANSITION", "Canot change request status")
    }

    const effectiveStartDate = startDate ?? current.startDate;
    const effectiveEndDate = endDate ?? current.endDate;
    const nextDays = calculateDays(effectiveStartDate, effectiveEndDate);
    const balanceDelta = getBalanceDelta(current.status, nextStatus, current.days, nextDays);

    const data: Prisma.LeaveRequestUpdateInput = {
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      days: nextDays
    };

    if (status !== undefined) {
      data.status = status;
    }

    if (employeeId !== undefined) {
      data.employee = { connect: { id: employeeId } };
    }

    if (leaveTypeCode !== undefined) {
      data.leaveType = { connect: { code: leaveTypeCode } };
    }

    if (reason !== undefined) {
      data.reason = reason;
    }

    const updated = await tx.leaveRequest.update({
      where: { id: reqId },
      data
    });

    if (balanceDelta !== 0) {
      await changeLeaveBalance(tx, balanceDelta, current.employeeId, current.leaveTypeId);
    }

    return updated;
  });
};

export const processLeaveRequest = (leaveRequestId: number, statusChange: LeaveApprovalStatus) =>
  updateLeaveRequest({ reqId: leaveRequestId, status: statusChange });

export const updateLeaveReqDetails = (input: leaveUpdateInputRequest) => updateLeaveRequest(input);
