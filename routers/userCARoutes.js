// routes/userRoutes.js
import express from 'express';
import { login, register } from '../controllers/userCAController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', authMiddleware('admin'), register);

export default router;
