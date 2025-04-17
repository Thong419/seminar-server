import express from 'express';
import { createCSR, getAllCSRs, downloadCSRFile } from '../controllers/csrController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Áp dụng middleware để chỉ user đã đăng nhập mới tạo CSR được
router.post('/generate-csr', authMiddleware(), createCSR);

// Cũng có thể yêu cầu user đăng nhập mới xem được danh sách CSR
router.get('/csrs', authMiddleware(), getAllCSRs);

// routes/csrRoutes.ts
router.post('/download', authMiddleware(), downloadCSRFile);

export default router;
