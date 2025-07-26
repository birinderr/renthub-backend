import User from '../models/User.js';
import { sendOTPEmail } from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';

const pendingUsers = new Map();

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
  });
};