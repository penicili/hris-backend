import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import type { ValidatedRequest } from "../../middlewares/validate.js";
import { assignUserSchema, idParamsSchema, newEmployeeSchema, updateEmployeeSchema } from './organization.schema.js'
import prisma from "../../lib/prisma.js";
/**
 * Tambahin employee baru
 * @param req 
 * @param res 
 * @returns 
 */
export const createEmployee = async (req: ValidatedRequest<typeof newEmployeeSchema>, res: Response) => {
  const { fullName, hireDate, nik, salary, departmentId, positionId, status } = req.body;

  try {
    const data: Prisma.EmployeeUncheckedCreateInput = { fullName, hireDate, nik, salary, departmentId, positionId, status }
    const employee = await prisma.employee.create({ data })
    res.status(201).json({
      message: 'Success',
      data: employee
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Failed to register new employee'
    })
  }
}
/**
 * Assign user ke employee yang udah ada, validasi dengan NIK dan nama panjang
 * TODO: mungkin nanti dipending dulu assignmentnya terus di ACC sama admin (?)
 * @param req {nik: nik input user, userId: userId, fullName: fullname input user}
 * @param res 
 * @returns 
 */
export const assignUser = async (req: ValidatedRequest<typeof assignUserSchema>, res: Response) => {
  // Assign existing user to existing employee
  // Perlu updat user.name ke fullname gak kira? (malas)
  const { nik, userId, fullName } = req.body;

  try {
    const data: Prisma.EmployeeUpdateInput = {
      user: {
        connect: { id: userId }
      }
    }
    const employee = await prisma.employee.update({ where: { nik: nik }, data })
    res.status(200).json({
      message: `Assigned ${employee.fullName} to user ${userId}`,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Failed to assign user to employee'
    })
  }

}

export const updateEmployee = async (
  req: ValidatedRequest<typeof updateEmployeeSchema> & ValidatedRequest<typeof idParamsSchema, 'params'>,
  res: Response
) => {
  const id = req.params.id
  const employeeId = Number(id)
  const { leadOf, ...updatedData } = req.body

  try {
    const data: Prisma.EmployeeUncheckedUpdateInput = { ...updatedData }

    // leadOf has no FK on Employee (Department.leadId holds it),
    // so it must be set as a relation, not as a scalar id
    if (leadOf != null) {
      const current = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { departmentId: true }
      })

      // a lead can only come from the department the employee sits in, which may
      // itself be moving in this same request
      const effectiveDepartmentId =
        'departmentId' in updatedData ? updatedData.departmentId : current?.departmentId ?? null

      if (effectiveDepartmentId !== leadOf) {
        return res.status(422).json({
          message: `Employee can only lead department with id: ${effectiveDepartmentId}`
        })
      }

      data.leadOf = { connect: { id: leadOf } }
    }

    const employee = await prisma.employee.update({ where: { id: employeeId }, data })

    return res.status(200).json({
      message: `Updated employee where id: ${employee.id}`,
      data: employee
    })
  } catch (error) {
    console.error(error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          message: `Cant find employee with id ${employeeId}`
        })
      }
      if (error.code === 'P2002') {
        return res.status(409).json({
          message: 'Employee already leads another department'
        })
      }
    }

    return res.status(500).json({
      message: 'Failed to update employee'
    })
  }
}

export const getAllEmployee = async (_req: Request, res: Response) => {
  try {
    const allEmployee = await prisma.employee.findMany();
    if (allEmployee.length === 0) {
      return res.status(204)
    }
    res.status(200).json({
      message: 'Successfully get all employee data',
      data: allEmployee
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error fetching employees data'
    })
  }

}

export const getEmployeeDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const EmployeeId = Number(id)
  try {
    const employee = await prisma.employee.findUnique({ where: { id: EmployeeId } })
    if (!employee) {
      return res.status(404).json({
        message: `Cant find employee with id ${id}`
      })
    }
    res.status(200).json({
      message: `Successfully get employee data with id ${id}`,
      data: employee
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Failure fetching details of employee with id ${id}`
    })
  }
}


export const getMyData = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {    
    const userData = await prisma.user.findUnique({ where: { id: userId } })
    const employeeData = await prisma.employee.findUnique({ where: { userId } })

    return res.status(200).json({
      data: userData, employeeData
    })
  } catch (error) {
    return res.status(404).json({
      message: `Cant find employee data for user with id ${userId}`
    })
  }


}