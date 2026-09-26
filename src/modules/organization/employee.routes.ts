import { Router } from "express";
import { getMyData, createEmployee, assignUser, updateEmployee, getAllEmployee, getEmployeeDetail } from "./employee.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { assignUserSchema, idParamsSchema, newEmployeeSchema, updateEmployeeSchema } from "./organization.schema.js";
import { departmentFromBody, departmentOfEmployeeFromBody, departmentOfEmployeeFromParams, denyDepartmentScopedFields, requireDepartmentAccess } from "../../middlewares/department.middleware.js";
import { PRIVILEGED_ROLES } from "../../utils/access.js";

const router = Router()

router.put('/:id', authenticate, authorize(PRIVILEGED_ROLES), validate(idParamsSchema, 'params'), validate(updateEmployeeSchema), requireDepartmentAccess(departmentOfEmployeeFromParams, { body: departmentFromBody }), denyDepartmentScopedFields(['leadOf']), updateEmployee);
router.post('/', authenticate, authorize(PRIVILEGED_ROLES), validate(newEmployeeSchema), requireDepartmentAccess(departmentFromBody), createEmployee);
router.post('/assignuser', authenticate, authorize(PRIVILEGED_ROLES), validate(assignUserSchema), requireDepartmentAccess(departmentOfEmployeeFromBody('employeeId')), assignUser);
router.get('/', authenticate, authorize(PRIVILEGED_ROLES), getAllEmployee)
router.get('/my', authenticate, getMyData)
router.get('/:id', authenticate, authorize(PRIVILEGED_ROLES), validate(idParamsSchema, 'params'), getEmployeeDetail)


export default router;
