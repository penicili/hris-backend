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
  return prisma.$transaction(async (tx) => {
    const leaveRequest = await tx.leaveRequest.findUnique({
      where: { id: leaveRequestId }
    });

    if (!leaveRequest) {
      throw new Error('nantilah');
    }

    const current = leaveRequest.status;
    if (!canTransition(current, statusChange)) {
      throw new Error('nantilah diurus');
    }

    // Check for race condition
    const result = await tx.leaveRequest.updateMany({
      where: { id: leaveRequestId, status: current },
      data: { status: statusChange }
    });

    if (result.count === 0) {
      throw new Error('Status sudah berubah, coba lagi');
    }

    if (current === 'APPROVED' && statusChange === 'CANCELLED') {
      await changeLeaveBalance(
        tx,
        leaveRequest.days,
        leaveRequest.employeeId,
        leaveRequest.leaveTypeId
      );
    } else if (current === 'PENDING' && statusChange === 'APPROVED') {
      await changeLeaveBalance(
        tx,
        -leaveRequest.days,
        leaveRequest.employeeId,
        leaveRequest.leaveTypeId
      );
    }

    return tx.leaveRequest.findUniqueOrThrow({
      where: { id: leaveRequestId }
    });
  });
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
