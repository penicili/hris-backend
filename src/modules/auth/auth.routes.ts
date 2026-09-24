import {register, login} from './auth.controller.js'
import { registerSchema } from './auth.schema.js'
import { validate } from '../../middlewares/validate.js'
import { Router } from 'express'

const router = Router();


router.post('/register', validate(registerSchema), register)
router.post('/login', login)

export default router