import type { NextFunction, Request, Response } from 'express';
import { getEmployeeDepartmentId, getLedDepartmentId, isGlobalRole, toId } from '../utils/access.js';


export type DepartmentTarget = (req: Request) => Promise<number | null>;

const unauthenticated = (res: Response) =>
  res.status(401).json({ message: 'Unauthorized' });

export const departmentFromParams: DepartmentTarget = async (req) => toId(req.params?.id);

export const departmentFromBody: DepartmentTarget = async (req) =>
  toId(req.body?.departmentId);
/**
 * Ambil department dari employee (dari params)
 * @param req 
 * @returns 
 */
export const departmentOfEmployeeFromParams: DepartmentTarget = async (req) => {
  const employeeId = toId(req.params?.id);
  if (employeeId === null) return null;

  return getEmployeeDepartmentId(employeeId);
};
/**
 * Ambil department asal employee
 * @param field 
 * @returns 
 */
export const departmentOfEmployeeFromBody =
  (field: string): DepartmentTarget =>
  async (req) => {
    const employeeId = toId(req.body?.[field]);
    if (employeeId === null) return null;

    return getEmployeeDepartmentId(employeeId);
  };

export type DepartmentScopeOptions = {

  body?: DepartmentTarget;
};


/**
 * Hanya lead dari departement x yang bisa ubah data department itu
 * @param target department target
 * @param options 
 * @returns 
 */
export const requireDepartmentAccess =
  (target: DepartmentTarget, options: DepartmentScopeOptions = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return unauthenticated(res);
    }

    if (isGlobalRole(user.role)) {
      return next();
    }

    try {
      const ledDepartmentId = await getLedDepartmentId(user.userId);

      if (ledDepartmentId === null) {
        return res.status(403).json({
          message: 'Forbidden: you do not lead any department',
        });
      }

      const targetDepartmentId = await target(req);
      if (targetDepartmentId !== ledDepartmentId) {
        return res.status(403).json({
          message: 'Forbidden: you can only manage the department you lead',
        });
      }

      const requestedDepartmentId = options.body ? await options.body(req) : null;
      if (requestedDepartmentId !== null && requestedDepartmentId !== ledDepartmentId) {
        return res.status(403).json({
          message: 'Forbidden: you can only reference the department you lead',
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Failed to verify department access',
      });
    }
  };

/**
 * Akses hanya oleh role Global (Admin dan executive)
 * @param fields 
 * @returns 
 */
export const denyDepartmentScopedFields =
  (fields: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return unauthenticated(res);
    }

    if (isGlobalRole(user.role)) {
      return next();
    }

    const present = fields.filter((field) => req.body?.[field] !== undefined);
    if (present.length > 0) {
      return res.status(403).json({
        message: `Forbidden: ${present.join(', ')} can only be changed by admin or executive`,
      });
    }

    next();
  };
