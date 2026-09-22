import { createDepartment, getAllDepartment, getDetails, updateDetails } from '../controllers/department.controller'
import { Router } from 'express';

const router = Router();
router.post('/', createDepartment)
router.put('/:id', updateDetails)
router.get('/', getAllDepartment)
router.get('/:id', getDetails)

export default router