import { createDepartment, getAllDepartment, getDetails, getMyDept, updateDetails } from './department.controller.js'
import { idParamsSchema, updateDepartmentSchema } from './organization.schema.js'
import { validate } from '../../middlewares/validate.js'
import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { departmentFromParams, denyDepartmentScopedFields, requireDepartmentAccess } from '../../middlewares/department.middleware.js';
import { GLOBAL_ROLES, PRIVILEGED_ROLES } from '../../utils/access.js';

const router = Router();
router.post('/', authenticate, authorize(GLOBAL_ROLES), createDepartment)
router.put('/:id', authenticate, authorize(PRIVILEGED_ROLES), validate(idParamsSchema, 'params'), validate(updateDepartmentSchema), requireDepartmentAccess(departmentFromParams), denyDepartmentScopedFields(['lead']), updateDetails)
router.get('/my', authenticate, getMyDept)
router.get('/', authenticate, authorize(PRIVILEGED_ROLES), getAllDepartment)
router.get('/:id', authenticate, authorize(PRIVILEGED_ROLES), validate(idParamsSchema, 'params'), getDetails)

export default router
