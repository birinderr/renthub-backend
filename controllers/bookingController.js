import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Item from '../models/Item.js';

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate('item', 'name pricePerDay image owner')
      .populate('owner', 'name email')
      .populate('renter', 'name email');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const createBooking = async (req, res) => {
  const { itemId, startDate, endDate } = req.body;

  if (!itemId || !startDate || !endDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const item = await Item.findById(itemId).populate('owner');
    if (!item /* || item.status !== 'approved' */) {
      return res.status(404).json({ message: 'Item not found or not available for booking' });
    }

    // Prevent user from booking their own item
    if (item.owner && item.owner._id && item.owner._id.toString() === req.user._id.toString()) {
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
      owner: (item.owner && item.owner._id) ? item.owner._id : item.owner,
      startDate: start,
      endDate: end,
      pricePerDay: item.pricePerDay,
      totalPrice,
      status: 'pending', 
    });

    const savedBooking = await booking.save();
    res.status(201).json({ message: 'Booking request created', booking: savedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get bookings for items owned by logged-in user (owner's incoming requests)
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

// Approve or reject booking
export const updateBookingStatus = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const bookingId = req.params.id;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    
    if (booking.status === status) {
      await session.commitTransaction();
      return res.status(200).json({ message: `Booking already ${status}`, booking });
    }

    if (status === 'approved') {
      
      booking.status = 'approved';
      await booking.save({ session });

      
      const itemId = booking.item;
      
      const item = await Item.findById(itemId).session(session);
      if (!item) {
        
        await session.abortTransaction();
        return res.status(404).json({ message: 'Associated item not found' });
      }

      
      await Item.deleteOne({ _id: itemId }).session(session);

      // Remove all other bookings for this item (including pending ones)
      await Booking.deleteMany({
        item: itemId,
        _id: { $ne: booking._id }
      }).session(session);

      await session.commitTransaction();

      // Populate renter and item info (item was deleted, but booking.item still has id)
      const populatedBooking = await Booking.findById(booking._id)
        .populate('renter', 'name email')
        .populate('owner', 'name email');

      return res.status(200).json({ message: 'Booking approved; item removed and other bookings removed', booking: populatedBooking });
    } else {
      booking.status = 'rejected';
      await booking.save({ session });
      await session.commitTransaction();

      const populatedBooking = await Booking.findById(booking._id)
        .populate('renter', 'name email')
        .populate('owner', 'name email')
        .populate('item', 'name pricePerDay image');

      return res.status(200).json({ message: 'Booking rejected', booking: populatedBooking });
    }
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};
