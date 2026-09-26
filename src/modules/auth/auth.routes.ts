import { register, login, me } from './auth.controller.js'
import { registerSchema } from './auth.schema.js'
import { validate } from '../../middlewares/validate.js'
import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware.js'

const router = Router();


router.post('/register', validate(registerSchema), register)
router.post('/login', login)
router.get('/me', authenticate, me)

export default router