import { Router } from 'express'
import authRoutes from './auth.routes'
import departmentRoutes from './department.routes'

const router = Router();

router.use('/auth', authRoutes)
router.use('/department', departmentRoutes)

export default router