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
  deleteItemByOwner,
} from '../controllers/itemController.js';

import { protect, isAdmin } from '../middleware/authMiddleware.js';

// uploading images
import upload from '../middleware/upload.js';

router.post('/', protect, isAdmin, upload.single('image'), createItem);

// Logged in users
router.get('/myitems', protect, getMyItems);
router.post('/request', protect, upload.single('image'), requestItem);


// Public
router.get('/', getItems);
router.get('/:id', getItemById);

// Admin
router.put('/:id', protect, admin, upload.single('image'), updateItem);
router.delete('/:id', protect, isAdmin, deleteItem);

// Private
router.delete('/owner/:id', protect, deleteItemByOwner);

export default router;
