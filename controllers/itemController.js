import Item from '../models/Item.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all approved items
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'approved' });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your items', error: err.message });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Public / Restricted
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // If item is not approved, allow only owner or admin to see it
    if (
      item.status !== 'approved' &&
      (!req.user || (req.user._id.toString() !== item.owner.toString() && !req.user.isAdmin))
    ) {
      return res.status(403).json({ message: 'Access denied. Item not approved yet.' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin creates an approved item directly
// @route   POST /api/items
// @access  Admin
export const createItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const owner = req.user._id;
    const imageUrl = req.file?.path;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image upload failed' });
    }

    const item = await Item.create({
      name,
      description,
      price,
      category,
      image: imageUrl,
      owner,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error creating item', error: error.message });
  }
};


// @desc    Admin updates an item
// @route   PUT /api/items/:id
// @access  Admin
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      item.name = req.body.name || item.name;
      item.description = req.body.description || item.description;
      item.image = req.body.image || item.image;
      item.category = req.body.category || item.category;
      item.pricePerDay = req.body.pricePerDay || item.pricePerDay;
      item.available = req.body.available ?? item.available;
      item.status = req.body.status || item.status;

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
};

// @desc    Admin deletes an item
// @route   DELETE /api/items/:id
// @access  Admin
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
};

// @desc    User requests an item to be listed
// @route   POST /api/items/request
// @access  Private
export const requestItem = async (req, res) => {
  try {
    const { name, description, category, pricePerDay } = req.body;
    const imageUrl = req.file?.path;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image upload failed' });
    }

    const item = await Item.create({
      name,
      description,
      category,
      pricePerDay,
      image: imageUrl,
      owner: req.user._id,
      status: 'pending'
    });

    res.status(201).json({ message: 'Item submitted for approval', item });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting item', error: err.message });
  }
};


// @desc    User deletes their own item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItemByOwner = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this item' });
  }

  await item.deleteOne();
  res.status(200).json({ message: 'Item deleted by owner successfully' });
});