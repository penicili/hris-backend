import {register, login} from './auth.controller'
import { registerSchema } from './auth.schema'
import { validate } from '../../middlewares/validate'
import { Router } from 'express'

const router = Router();


router.post('/register', validate(registerSchema), register)
router.post('/login', login)

export default router