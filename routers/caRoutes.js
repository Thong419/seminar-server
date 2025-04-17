import express from 'express';
import { createCA, getAllCAs, getCA } from '../controllers/caController.js';

const router = express.Router();

router.route('/').get(getAllCAs).post(createCA);
router.route('/:id').get(getCA);

export default router;
