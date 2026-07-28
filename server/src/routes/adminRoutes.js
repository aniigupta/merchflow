import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = Router();

// Apply admin locks to all routes
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);

export default router;
