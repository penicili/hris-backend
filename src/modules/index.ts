import { Router } from 'express';
import authRoutes from './auth/auth.routes.js';
import departmentRoutes from './organization/department.routes.js';
import employeeRoutes from './organization/employee.routes.js';
import leaveRoutes from './leave/leave.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/department', departmentRoutes);
router.use('/employee', employeeRoutes);
router.use('/pto', leaveRoutes);

export default router;
