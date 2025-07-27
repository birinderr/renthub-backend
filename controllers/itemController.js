import Item from '../models/Item.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Admin
export const createItem = async (req, res) => {
  try {
    const { name, description, image, category, price, available } = req.body;

    const item = new Item({
      name,
      description,
      image,
      category,
      price,
      available,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create item', error: error.message });
  }
};

// @desc    Update an item
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
      item.price = req.body.price || item.price;
      item.available = req.body.available ?? item.available;

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
};

// @desc    Delete an item
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

// @desc    User submits a new item for rent
// @route   POST /api/items/request
// @access  Private (Logged-in users)
export const requestItem = async (req, res) => {
  try {
    const { name, description, category, price, image } = req.body;

    const item = await Item.create({
      name,
      description,
      category,
      price,
      image,
      owner: req.user._id,
      isApproved: false, // default false until admin approves
    });

    res.status(201).json({ message: 'Item submitted for approval', item });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting item', error: err.message });
  }
};