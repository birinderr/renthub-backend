import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import User from '../models/User.js';

// Get all bookings for the logged-in user(renter)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate('item', 'name pricePerDay image owner')
      .populate('owner', 'name email');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Put up a booking request
export const createBooking = async (req, res) => {
  const { itemId, startDate, endDate } = req.body;

  if (!itemId || !startDate || !endDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const item = await Item.findById(itemId).populate('owner');
    if (!item || item.status !== 'approved') {
      return res.status(404).json({ message: 'Item not found or not available for booking' });
    }

    // Prevent user from booking their own item
    if (item.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own item' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (days <= 0) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const totalPrice = item.pricePerDay * days;

    const booking = new Booking({
      item: item._id,
      renter: req.user._id,
      owner: item.owner._id || item.owner,
      startDate: start,
      endDate: end,
      pricePerDay: item.pricePerDay,
      totalPrice,
    });

    const savedBooking = await booking.save();
    res.status(201).json({ message: 'Booking request created', booking: savedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get owner's bookings
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('item', 'name pricePerDay image')
      .populate('renter', 'name email');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// approve or reject the booking made by user
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    booking.status = status;
    const updated = await booking.save();

    res.status(200).json({ message: `Booking ${status}`, booking: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
