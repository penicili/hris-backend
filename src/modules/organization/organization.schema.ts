import { z } from 'zod';
import { Status, EmploymentStatus } from '../../generated/prisma/client.js';

export const newEmployeeSchema = z.object({
  nik: z.string(),
  fullName: z.string(),
  hireDate: z.coerce.date(),
  status: z.enum(Status),
  salary: z.int(),
  employment: z.enum(EmploymentStatus).optional(),
  departmentId: z.number().int().optional(),
  positionId: z.number().int()
})

export const updateEmployeeSchema = z.object({
  fullName: z.string().optional(),
  hireDate: z.coerce.date().optional(),
  status: z.enum(Status).optional(),
  salary: z.int().optional(),
  employment: z.enum(EmploymentStatus).nullish(),
  departmentId: z.number().int().nullish(),
  positionId: z.number().int().optional(),
  leadOf: z.number().int().optional(),
})

export const assignUserSchema = z.object({
  employeeId: z.number().int(),
  userId: z.number().int()
})

export const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/)
})