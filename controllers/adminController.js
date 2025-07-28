import User from '../models/User.js';
import Item from '../models/Item.js';

// @desc    Get all users (excluding passwords)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllItemsAdmin = async (req, res) => {
  try {
    const items = await Item.find().populate('owner', 'name email');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all items', error: err.message });
  }
};

// @desc    Delete a user by admin
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete themselves' });
    }

    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user details by admin
// @route   PUT /api/admin/users/:id
// @access  Admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin ?? user.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin approves an item
// @route   PUT /api/admin/items/:id/approve
// @access  Admin
export const approveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.status = 'approved';

    const updated = await item.save();

    res.json({ message: 'Item approved', item: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error approving item', error: err.message });
  }
};

// admin rejects an item
// @route   PUT /api/admin/items/:id/reject
// @access  Admin
export const rejectItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.status = 'rejected';
    const updated = await item.save();
    res.json({ message: 'Item rejected', item: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting item', error: err.message });
  }
};

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ isAdmin: true });

    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const approvedItems = await Item.countDocuments({ status: 'approved' });
    const rejectedItems = await Item.countDocuments({ status: 'rejected' });

    res.json({
      totalUsers,
      adminCount,
      totalItems,
      pendingItems,
      approvedItems,
      rejectedItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting admin stats', error: error.message });
  }
};