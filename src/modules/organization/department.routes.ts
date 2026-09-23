import { createDepartment, getAllDepartment, getDetails, updateDetails } from './department.controller'
import { idParamsSchema } from './organization.schema'
import { validate } from '../../middlewares/validate'
import { Router } from 'express';

const router = Router();
router.post('/', createDepartment)
router.put('/:id', validate(idParamsSchema, 'params'), updateDetails)
router.get('/', getAllDepartment)
router.get('/:id', validate(idParamsSchema, 'params'), getDetails)

export default router