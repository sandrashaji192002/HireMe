const express = require('express');
const { User } = require('../db/models');
const { checkToken, isRoleAllowed } = require('../middlewares/auth');
const fs = require('fs');
const router = express.Router();
const { uploadPhoto, uploadResume } = require('../middlewares/multerConfig');
const path = require('path');

const handleResumeUpload = (req, res, next) => {
  uploadResume.single('resume')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

const handlePhotoUpload = (req, res, next) => {
  uploadPhoto.single('profileImage')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

router.put(
  '/api/profile/update',
  checkToken,
  isRoleAllowed(['student']),
  async (req, res) => {
    try {
      const {
        name,
        bio,
        location,
        githubUrl,
        linkedinUrl,
        skills,
        education,
        experience,
      } = req.body;

      if (req.body.role || req.body.email || req.body.password) {
        return res
          .status(400)
          .json({ message: 'These fields cannot be updated here' });
      }

      if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      if (
        skills !== undefined &&
        !(Array.isArray(skills) && skills.every(s => typeof s === 'string'))
      ) {
        return res
          .status(400)
          .json({ message: 'Skills must be an array of strings' });
      }
      if (
        education !== undefined &&
        !(
          Array.isArray(education) &&
          education.every(e => e && typeof e === 'object')
        )
      ) {
        return res
          .status(400)
          .json({ message: 'Education must be an array of objects' });
      }
      if (
        experience !== undefined &&
        !(
          Array.isArray(experience) &&
          experience.every(e => e && typeof e === 'object')
        )
      ) {
        return res
          .status(400)
          .json({ message: 'Experience must be an array of objects' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updates = {
        name,
        bio,
        location,
        githubUrl,
        linkedinUrl,
        skills,
        education,
        experience,
      };

      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) delete updates[key];
      });

      await user.update(updates);

      const safeUser = user.toJSON();
      delete safeUser.password;
      return res
        .status(200)
        .json({ message: 'User updated successfully', user: safeUser });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.post(
  '/api/profile/resume',
  checkToken,
  isRoleAllowed(['student']),
  handleResumeUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Resume PDF is required' });
      }
      const user = await User.findByPk(req.user.id);
      if (!user) {
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.resumeUrl) {
        const oldFilePath = path.join(
          __dirname,
          '..',
          'uploads',
          user.resumeUrl
        );
        fs.unlink(oldFilePath, () => {});
      }

      user.resumeUrl = `/resumes/${req.file.filename}`;
      await user.save();

      return res.status(200).json({
        message: 'Resume uploaded successfully',
        resumeUrl: user.resumeUrl,
      });
    } catch (e) {
      console.log(e);
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.post(
  '/api/profile/photo',
  checkToken,
  isRoleAllowed(['student', 'recruiter']),
  handlePhotoUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        fs.unlink(req.file.path, () => {}); // remove the new file
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.profileImageUrl) {
        const oldFilePath = path.join(
          __dirname,
          '..',
          'uploads',
          user.profileImageUrl
        );
        fs.unlink(oldFilePath, () => {});
      }

      user.profileImageUrl = `/photos/${req.file.filename}`;
      await user.save();

      return res.status(200).json({
        message: 'Photo updated successfully',
        profileImageUrl: user.profileImageUrl,
      });
    } catch (e) {
      console.log(e);
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

module.exports = router;
