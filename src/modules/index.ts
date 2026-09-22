import { Router } from 'express'
import authRoutes from './auth/auth.routes'
import departmentRoutes from './organization/department.routes'

const router = Router();

router.use('/auth', authRoutes)
router.use('/department', departmentRoutes)

export default router