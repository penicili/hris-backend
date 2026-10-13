import {
  applyLeaveController,
  processLeaveRequestController,
  updateLeaveController
} from './leave.controller.js';
import Router from 'express';

const router = Router();
router.use('/pto');
router.post('/apply', applyLeaveController);
router.put('/edit', updateLeaveController);
router.patch('/process', processLeaveRequestController);
