import { Router } from "express";
import { createEmployee, assignUser, updateEmployee, getAllEmployee, getEmployeeDetail } from "./employee.controller";

const router = Router()

router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.post('/assignuser', assignUser);
router.get('/', getAllEmployee)
router.get('/:id', getEmployeeDetail)

export default router;