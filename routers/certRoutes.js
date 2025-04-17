import express from 'express';
import { createCert, getAllCerts, getCert } from '../controllers/certController.js';

const router = express.Router();

router.route('/').get(getAllCerts).post(createCert);
router.route('/:id').get(getCert);

export default router;
