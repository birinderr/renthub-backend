import User from '../models/User.js';
import { sendOTPEmail } from '../utils/sendEmail.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

const pendingUsers = new Map();

// register a new user with otp verification
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    pendingUsers.set(email, {
      name,
      password: await bcrypt.hash(password, 10),
      otp,
      timestamp: Date.now(),
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
};

// login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//verify user with otp
export const verifyUser = async (req, res) => {
  const { email, otp } = req.body;
  const record = pendingUsers.get(email);

  if (!record) return res.status(400).json({ message: 'No pending user found' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  const user = await User.create({
    name: record.name,
    email,
    password: record.password,
  });

  pendingUsers.delete(email);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
};

// get user profile
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    // user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10); // creating random string
      user.password = await bcrypt.hash(req.body.password, salt); // adding the random string to the hashed password
    }

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
