import { UserRole } from '../generated/prisma/client.js';
import prisma from '../lib/prisma.js';


export const GLOBAL_ROLES: readonly UserRole[] = [UserRole.admin, UserRole.executive];

export const isGlobalRole = (role: UserRole): boolean => GLOBAL_ROLES.includes(role);

export const PRIVILEGED_ROLES: readonly UserRole[] = [
  UserRole.admin,
  UserRole.executive,
  UserRole.management,
];


export const getLedDepartmentId = async (userId: number): Promise<number | null> => {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { leadOf: { select: { id: true } } },
  });

  return employee?.leadOf?.id ?? null;
};

export const getEmployeeDepartmentId = async (
  employeeId: number
): Promise<number | null> => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { departmentId: true },
  });

  return employee?.departmentId ?? null;
};

export const toId = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;

  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};
