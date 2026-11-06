const express = require('express');
const router = express.Router();
const { checkToken, isRoleAllowed } = require('../middlewares/auth');
const { Job, User, Application } = require('../db/models');
const jobTypes = ['full-time', 'part-time', 'internship', 'contract'];
const { Op } = require('sequelize');

const currentDate = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

router.post(
  '/api/jobs',
  checkToken,
  isRoleAllowed(['recruiter']),
  async (req, res) => {
    try {
      const {
        title,
        company,
        location,
        type,
        description,
        skillsRequired,
        deadline,
      } = req.body;

      if (
        !title ||
        !company ||
        !location ||
        !type ||
        !description ||
        !deadline
      ) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (
        typeof title !== 'string' ||
        typeof company !== 'string' ||
        typeof location !== 'string' ||
        typeof description !== 'string' ||
        typeof deadline !== 'string'
      ) {
        return res.status(400).json({ message: 'Fields must be text' });
      }

      if (
        !title.trim() ||
        !company.trim() ||
        !location.trim() ||
        !description.trim()
      ) {
        return res.status(400).json({ message: 'Fields cannot be empty' });
      }

      if (!jobTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid Type' });
      }

      if (
        skillsRequired !== undefined &&
        !(
          Array.isArray(skillsRequired) &&
          skillsRequired.every(s => typeof s === 'string')
        )
      ) {
        return res
          .status(400)
          .json({ message: 'SkillsRequired must be an array of strings' });
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
        isNaN(new Date(deadline).getTime())
      ) {
        return res
          .status(400)
          .json({ message: 'Deadline must be a valid date (YYYY-MM-DD)' });
      }
      if (deadline < currentDate()) {
        return res
          .status(400)
          .json({ message: 'Deadline cannot be in the past' });
      }

      const job = await Job.create({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        description: description.trim(),
        skillsRequired: skillsRequired || [],
        deadline,
        recruiterId: req.user.id,
      });

      return res.status(201).json({ message: 'Job posted successfully', job });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.put(
  '/api/jobs/:id',
  checkToken,
  isRoleAllowed(['recruiter']),
  async (req, res) => {
    try {
      const {
        title,
        company,
        location,
        type,
        description,
        skillsRequired,
        deadline,
        isActive,
      } = req.body;

      const job = await Job.findByPk(req.params.id);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      if (job.recruiterId !== req.user.id) {
        return res
          .status(403)
          .json({ message: 'You can only edit your own jobs' });
      }

      const textFields = { title, company, location, description };
      for (const key of Object.keys(textFields)) {
        const value = textFields[key];
        if (
          value !== undefined &&
          (typeof value !== 'string' || !value.trim())
        ) {
          return res.status(400).json({ message: `${key} cannot be empty` });
        }
      }

      if (type !== undefined && !jobTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid Type' });
      }

      if (
        skillsRequired !== undefined &&
        !(
          Array.isArray(skillsRequired) &&
          skillsRequired.every(s => typeof s === 'string')
        )
      ) {
        return res
          .status(400)
          .json({ message: 'SkillsRequired must be an array of strings' });
      }

      if (deadline !== undefined) {
        if (
          typeof deadline !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
          isNaN(new Date(deadline).getTime())
        ) {
          return res
            .status(400)
            .json({ message: 'Deadline must be a valid date (YYYY-MM-DD)' });
        }
        if (deadline < currentDate()) {
          return res
            .status(400)
            .json({ message: 'Deadline cannot be in the past' });
        }
      }

      if (isActive !== undefined && typeof isActive !== 'boolean') {
        return res
          .status(400)
          .json({ message: 'isActive must be true or false' });
      }

      const updates = {
        title,
        company,
        location,
        type,
        description,
        skillsRequired,
        deadline,
        isActive,
      };
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
          delete updates[key];
        } else if (typeof updates[key] === 'string') {
          updates[key] = updates[key].trim();
        }
      });

      await job.update(updates);
      return res.status(200).json({ message: 'Job updated successfully', job });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.get('/api/jobs', checkToken, async (req, res) => {
  try {
    const { search, type, location } = req.query;
    const where = { isActive: true, deadline: { [Op.gte]: currentDate() } };

    if (search) where.title = { [Op.like]: `%${search}%` };
    if (type) where.type = type;
    if (location) where.location = { [Op.like]: `%${location}%` };

    const jobs = await Job.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ count: jobs.length, jobs });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Server Error' });
  }
});

router.get(
  '/api/jobs/my',
  checkToken,
  isRoleAllowed(['recruiter']),
  async (req, res) => {
    try {
      const jobs = await Job.findAll({
        where: { recruiterId: req.user.id },
        include: [
          { model: Application, as: 'applications', attributes: ['id'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      const result = jobs.map(job => {
        const data = job.toJSON();
        data.applicantCount = data.applications.length;
        delete data.applications;
        return data;
      });

      return res.status(200).json({ count: result.length, jobs: result });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.get('/api/jobs/:id', checkToken, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'name', 'profileImageUrl'],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ job });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: 'Server Error' });
  }
});

router.delete(
  '/api/jobs/:id',
  checkToken,
  isRoleAllowed(['recruiter']),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.id);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (job.recruiterId !== req.user.id) {
        return res
          .status(403)
          .json({ message: 'You can only delete your own jobs' });
      }

      await job.destroy();
      return res.status(200).json({ message: 'Job deleted successfully' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

module.exports = router;
