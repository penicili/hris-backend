import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';


export const createDepartment = async (req: Request, res: Response) => {

  const { name } = req.body

  const newDept = await prisma.department.create({
    data: { name: name }
  })

  res.status(201).json({
    message: `Succesfully created department "${newDept.name}" with id: ${newDept.id}`,
    data: newDept
  })
}

export const getAllDepartment = async (_req: Request,  res: Response) => {
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
  const { deptId } = req.params
  const id = Number(deptId)

  try {
    const dept = await prisma.department.findUnique({ where: { id } })
    return res.status(200).json({
      data: dept
    })
  } catch (error) {
    return res.status(404).json({
      message: `Cant find department with id ${id}`
    })
  }
}

export const updateDetails = async (req: Request, res: Response) => {
  const { lead, name, positions, id } = req.body;
  try {
    const updatedDept = prisma.department.update({ where: { id }, data: { lead, name, positions } })
    return res.status(200).json({
      message: `Updated department where id: ${id}`,
      data: updatedDept
    })
  } catch (error) {
    return res.status(500)
  }
}