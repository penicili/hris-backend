import { Router } from 'express'
import authRoutes from './auth/auth.routes'
import departmentRoutes from './organization/department.routes'
import employeeRoutes from './organization/employee.routes'

const router = Router();

router.use('/auth', authRoutes)
router.use('/department', departmentRoutes)
router.use('/employee', employeeRoutes)

export default router