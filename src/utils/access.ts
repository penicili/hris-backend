import { UserRole } from '../generated/prisma/client.js';
import prisma from '../lib/prisma.js';

/**
 * Roles dengan akses global, UserRole.admin dan UserRole.executive
 */
export const GLOBAL_ROLES: readonly UserRole[] = [UserRole.admin, UserRole.executive];
/**
 * Check apakah user role nya adalah global
 * @param role req.user.role
 * @returns bool
 */
export const isGlobalRole = (role: UserRole): boolean => GLOBAL_ROLES.includes(role);
/**
 * Privileged roles
 */
export const PRIVILEGED_ROLES: readonly UserRole[] = [
  UserRole.admin,
  UserRole.executive,
  UserRole.management,
];

/**
 * Cari id departemen yang dipimpin user (kalo ada)
 * @param userId 
 * @returns id department yang dipimpin user: number || null
 */
export const getLedDepartmentId = async (userId: number): Promise<number | null> => {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { leadOf: { select: { id: true } } },
  });

  return employee?.leadOf?.id ?? null;
};
/**
 * Select department id
 * @param employeeId 
 * @returns department id | null
 */
export const getEmployeeDepartmentId = async (
  employeeId: number
): Promise<number | null> => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { departmentId: true },
  });

  return employee?.departmentId ?? null;
};

/**
 * Helper function ubah id jadi number
 */
export const toId = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;

  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};
