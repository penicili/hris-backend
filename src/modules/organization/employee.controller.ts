import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import type { ValidatedRequest } from "../../middlewares/validate";
import { assignUserSchema, newEmployeeSchema, updateEmployeeSchema } from './organization.schema'
import prisma from "../../lib/prisma";

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

export const assignUser = async (req: ValidatedRequest<typeof assignUserSchema>, res: Response) => {
  // Assign existing user to existing employee
  // Perlu updat user.name ke fullname gak kira? (malas)
  const { employeeId, userId } = req.body;

  try {
    const data: Prisma.EmployeeUpdateInput = {
      user: {
        connect: { id: userId }
      }
    }
    const employee = await prisma.employee.update({ where: { id: employeeId }, data })
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

export const updateEmployee = async (req: ValidatedRequest<typeof updateEmployeeSchema>, res: Response) => {
  const { id } = req.params
  const employeeId = Number(id)
  const { leadOf, ...updatedData } = req.body

  try {
    const data: Prisma.EmployeeUncheckedUpdateInput = { ...updatedData }

    // leadOf has no FK on Employee (Department.leadId holds it),
    // so it must be set as a relation, not as a scalar id
    if (leadOf != null) {
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