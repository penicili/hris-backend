import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js'
import { env } from '../../config/env.js';
import { registerSchema } from './auth.schema.js';
import type { ValidatedRequest } from '../../middlewares/validate.js';

export const register = async (req: ValidatedRequest<typeof registerSchema>, res: Response) => {

  const { email, password, name } = req.body;

  const isExist = await prisma.user.findUnique({ where: { email } })
  if (isExist) {
    return res.status(409).json({
      message: 'Email exist'
    })
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email, name, passwordHash
    }
  })

  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name
  })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign(
    {userId: user.id, role: user.role},
    env.jwtSecret!,
    {expiresIn: env.jwtTTL as any ?? '2d'}
  )
  res.json({token})
}

export const logout = async (req: Request, res: Response) => {
  return null
}

