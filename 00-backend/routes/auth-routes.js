const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User } = require('../db/models');
const { uploadPhoto } = require('../middlewares/multerConfig');
const fs = require('fs');
const { checkToken } = require('../middlewares/auth');

const fail = (req, res, status, message) => {
  if (req.file) fs.unlink(req.file.path, () => {});
  return res.status(status).json({ message });
};

const handleUpload = (req, res, next) => {
  uploadPhoto.single('profileImage')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

router.post('/api/auth/register', handleUpload, async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return fail(req, res, 400, 'All fields are required');
    }

    if (!['student', 'recruiter'].includes(role)) {
      return fail(req, res, 400, 'Invalid role');
    }
    if (!PASSWORD_REGEX.test(password)) {
      return fail(
        req,
        res,
        400,
        'Password must be atleast 6 characters with atleast 1 capital letter, 1 number and 1 special character'
      );
    }
    if (password !== confirmPassword) {
      return fail(req, res, 400, "Passwords don't match");
    }
    const emailLowerCase = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      where: { email: emailLowerCase },
    });
    if (existingUser) {
      return fail(req, res, 400, 'Email already registered');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: emailLowerCase,
      password: hashPassword,
      role,
      profileImageUrl: req.file ? `/photos/${req.file.filename}` : null,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (e) {
    console.log(e);
    return fail(req, res, 500, 'Server Error');
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email & Password Required' });
    }

    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/api/auth/me', checkToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'No user Found' });
    }
    return res.status(200).json({ user });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;
