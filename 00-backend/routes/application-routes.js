const express = require('express');
const router = express.Router();
const { checkToken, isRoleAllowed } = require('../middlewares/auth');
const { Application, Job, User } = require('../db/models');

const nextStatus = {
  applied: ['reviewed'],
  reviewed: ['shortlisted', 'rejected'],
  shortlisted: ['rejected'],
  rejected: [],
};

const currentDate = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

router.post(
  '/api/applications/apply/:jobId',
  checkToken,
  isRoleAllowed(['student']),
  async (req, res) => {
    try {
      const { coverNote } = req.body;

      if (coverNote !== undefined && typeof coverNote !== 'string') {
        return res.status(400).json({ message: 'Cover note must be text' });
      }

      const job = await Job.findByPk(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (!job.isActive || job.deadline < currentDate()) {
        return res
          .status(400)
          .json({ message: 'This job is no longer accepting applications' });
      }

      const alreadyApplied = await Application.findOne({
        where: { jobId: job.id, studentId: req.user.id },
      });
      if (alreadyApplied) {
        return res
          .status(409)
          .json({ message: 'You have already applied to this job' });
      }

      const application = await Application.create({
        jobId: job.id,
        studentId: req.user.id,
        coverNote: coverNote ? coverNote.trim() : null,
      });

      return res
        .status(201)
        .json({ message: 'Applied successfully', application });
    } catch (e) {
      console.log(e);

      if (e.name === 'SequelizeUniqueConstraintError') {
        return res
          .status(409)
          .json({ message: 'You have already applied to this job' });
      }
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.get(
  '/api/applications/my',
  checkToken,
  isRoleAllowed(['student']),
  async (req, res) => {
    try {
      const applications = await Application.findAll({
        where: { studentId: req.user.id },
        include: [
          {
            model: Job,
            as: 'job',
            attributes: [
              'id',
              'title',
              'company',
              'location',
              'type',
              'deadline',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({ count: applications.length, applications });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.get(
  '/api/applications/job/:jobId',
  checkToken,
  isRoleAllowed(['recruiter']),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (job.recruiterId !== req.user.id) {
        return res
          .status(403)
          .json({ message: 'You can only view applicants of your own jobs' });
      }

      const applications = await Application.findAll({
        where: { jobId: job.id },
        include: [
          {
            model: User,
            as: 'student',
            attributes: [
              'id',
              'name',
              'email',
              'profileImageUrl',
              'bio',
              'location',
              'githubUrl',
              'linkedinUrl',
              'skills',
              'education',
              'experience',
              'resumeUrl',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        job: { id: job.id, title: job.title, company: job.company },
        count: applications.length,
        applications,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.put(
  '/api/applications/:id/status',
  checkToken,
  isRoleAllowed(['recruiter']),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (
        typeof status !== 'string' ||
        !Object.keys(nextStatus).includes(status)
      ) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const application = await Application.findByPk(req.params.id, {
        include: [{ model: Job, as: 'job' }],
      });
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      if (application.job.recruiterId !== req.user.id) {
        return res.status(403).json({
          message: 'You can only update applications for your own jobs',
        });
      }

      if (!nextStatus[application.status].includes(status)) {
        return res.status(400).json({
          message: `Cannot change status from ${application.status} to ${status}`,
        });
      }

      application.status = status;
      await application.save();

      return res
        .status(200)
        .json({ message: 'Status updated successfully', application });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

module.exports = router;
