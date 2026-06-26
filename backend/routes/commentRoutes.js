import express from 'express';

import {
  editComment,
  deleteComment,
} from '../controllers/commentController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.put('/:id', editComment);
router.delete('/:id', deleteComment);

export default router;