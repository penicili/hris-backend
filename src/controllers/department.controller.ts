import type { Request, Response } from 'express';
import prisma from '../lib/prisma';


export const createDepartment = async (req: Request, res: Response) => {

  const { name } = req.body

  const newDept = await prisma.department.create({
    data: { name: name }
  })

  res.status(201).json({
    message: `Succesfully created department "${newDept.name}" with id: ${newDept.id}`
  })
}

export const getAllDepartment = async (res: Response) => {
  try {

    const allDepartment = await prisma.department.findMany()

    if (!allDepartment) {
      return res.status(204).json({
        message: 'No departments found'
      })
    }

    res.status(200).json({
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
//   const {depName} = req.body;
//   try{
    
//   }
// }