import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import type { ValidatedRequest } from '../../middlewares/validate.js';
import prisma from '../../lib/prisma.js';
import { getLedDepartmentId } from '../../utils/access.js';
import type { idParamsSchema, updateDepartmentSchema } from './organization.schema.js';


export const createDepartment = async (req: Request, res: Response) => {

  const { name } = req.body

  try {
    const newDept = await prisma.department.create({
      data: { name: name }
    })

    res.status(201).json({
      message: `Succesfully created department "${newDept.name}" with id: ${newDept.id}`,
      data: newDept
    })
  } catch (error) {
    console.error(error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({
        message: `Department "${name}" already exist`
      })
    }

    return res.status(500).json({
      message: 'Failed to create department'
    })
  }
}

export const getAllDepartment = async (_req: Request, res: Response) => {
  try {

    const allDepartment = await prisma.department.findMany()

    if (allDepartment.length === 0) {
      return res.status(204).json({
        message: 'No departments found'
      })
    }

    res.status(200).json({
      message: `Success`,
      data: allDepartment
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Failed to get departments"
    })
  }

}

// export const getLead = async (req: Request, res: Response) => {
//   const { depId } = req.body;
//   try {
//     const depLead = await prisma.employee.findFirst({
//       where: {
//         leadOf: {
//           id: depId
//         }
//       }
//     })
//     res.status(200).json({
//       data: depLead
//     })
//   } catch (error) {
//     return res.status(500).json({
//       message: `Failure to get department lead of department with id: ${depId}`
//     })
//   }
// }

export const getDetails = async (req: Request, res: Response) => {
  const id = Number(req.params.id)

  try {
    const dept = await prisma.department.findUnique({ where: { id }, include: { lead: true } })
    if (!dept) {
      return res.status(404).json({
        message: `Cant find department with id ${id}`
      })
    }
    return res.status(200).json({
      data: dept
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: `Cant find department with id ${id}`
    })
  }
}

export const updateDetails = async (
  req: ValidatedRequest<typeof updateDepartmentSchema> & ValidatedRequest<typeof idParamsSchema, 'params'>,
  res: Response
) => {
  const id = Number(req.params.id)
  const { name, lead } = req.body

  try {
    if (lead != null) {
      const employee = await prisma.employee.findUnique({
        where: { id: lead },
        select: { departmentId: true }
      })

      if (!employee) {
        return res.status(404).json({
          message: `Cant find employee with id ${lead} to assign as lead`
        })
      }

      if (employee.departmentId !== id) {
        return res.status(422).json({
          message: `Lead must be an employee of department with id: ${id}`
        })
      }
    }

    const data: Prisma.DepartmentUpdateInput = {}
    if (name !== undefined) data.name = name
    if (lead !== undefined) {
      data.lead = lead === null ? { disconnect: true } : { connect: { id: lead } }
    }

    const updatedDept = await prisma.department.update({
      where: { id },
      data,
      include: { lead: true }
    })

    return res.status(200).json({
      message: `Updated department where id: ${id}`,
      data: updatedDept
    })
  } catch (error) {
    console.error(error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          message: `Cant find department with id ${id}`
        })
      }
      if (error.code === 'P2002') {
        return res.status(409).json({
          message: `Department name "${name}" already exist`
        })
      }
    }

    return res.status(500).json({
      message: 'Failed to update department'
    })
  }
}

export const getMyDept = async (req: Request, res: Response) => {
  const userId = req.user!.userId
  const ledDeptId = await getLedDepartmentId(userId)

  if (ledDeptId === null) {
    return res.status(403).json({
      message: 'Failed to get department data, are you a manager?'
    })
  }

  try {
    const ledDept = await prisma.department.findUnique({
      where: { id: ledDeptId },
      include: { lead: true, employees: true }
    })

    return res.status(200).json({
      message: `Success`, data: ledDept
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Failed to get department data, are you a manager?'
    })
  }
}