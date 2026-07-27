const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const cookieName = 'jwt';

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
};

const sendTokenCookie = (res, userId) => {
  const token = generateToken(userId);
  res.cookie(cookieName, token, getCookieOptions());
};

const getPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400);
      throw new Error('Email already exists');
    }

    const user = await User.create({ name, email, password });
    sendTokenCookie(res, user._id);

    res.status(201).json({
      success: true,
      user: getPublicUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    sendTokenCookie(res, user._id);

    res.json({
      success: true,
      user: getPublicUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

const getCurrentUser = (req, res) => {
  res.json({
    success: true,
    user: getPublicUser(req.user)
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
};
