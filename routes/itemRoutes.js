import express from 'express';
const router = express.Router();

import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

// Public
router.get('/', getItems);
router.get('/:id', getItemById);

// Admin
router.post('/', protect, admin, createItem);
router.put('/:id', protect, admin, updateItem);
router.delete('/:id', protect, admin, deleteItem);

export default router;
