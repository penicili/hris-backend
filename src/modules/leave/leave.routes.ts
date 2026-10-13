import {
  applyLeaveController,
  processLeaveRequestController,
  updateLeaveController
} from './leave.controller.js';
import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { PRIVILEGED_ROLES } from '../../utils/access.js';
import {
  newLeaveRequestSchema,
  processLeaveStatusSchema,
  updateLeaveRequestSchema
} from './leave.schema.js';

const router = Router();

router.post('/pto/apply', authenticate, validate(newLeaveRequestSchema), applyLeaveController);

router.put('/pto/edit', authenticate, validate(updateLeaveRequestSchema), updateLeaveController);

router.patch(
  '/pto/process',
  authenticate,
  authorize(PRIVILEGED_ROLES),
  validate(processLeaveStatusSchema),
  processLeaveRequestController
);

export default router;
