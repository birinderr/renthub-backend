import express from 'express';
const router = express.Router();

import {
  getItems,
  getItemById,
  getMyItems,
  createItem,
  updateItem,
  deleteItem,
  requestItem,
} from '../controllers/itemController.js';

import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Logged in users
router.get('/myitems', protect, getMyItems);
router.post('/request', protect, requestItem);


// Public
router.get('/', getItems);
router.get('/:id', getItemById);

// Admin
router.post('/', protect, isAdmin, createItem);
router.put('/:id', protect, isAdmin, updateItem);
router.delete('/:id', protect, isAdmin, deleteItem);

export default router;
