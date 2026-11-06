import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Spin, Empty, Popconfirm, message } from 'antd';
import {
  MapPin,
  CalendarDays,
  Users,
  SquarePen,
  Trash2,
  Plus,
  Building2,
  Briefcase,
  CheckCircle,
  Eye,
  Power,
} from 'lucide-react';
import { authFetch } from '../../utils/api';
import { formatDate, getToday } from '../../utils/helpers';
import './recruiter-dashboard.css';

const getJobStatus = job => {
  if (!job.isActive) return { label: 'Closed', color: 'default' };
  if (job.deadline < getToday()) return { label: 'Expired', color: 'orange' };
  return { label: 'Active', color: 'green' };
};

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getJobs = async () => {
    try {
      const response = await authFetch('/api/jobs/my');
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs);
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    getJobs();
  }, []);

  const onToggleActive = async job => {
    try {
      const response = await authFetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      const data = await response.json();

      if (response.ok) {
        if (!job.isActive && job.deadline < getToday()) {
          message.warning(
            'Job reopened, but its deadline has passed. Edit the job to set a new deadline.'
          );
        } else {
          message.success(job.isActive ? 'Job closed' : 'Job reopened');
        }
        getJobs();
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
  };

  const onDelete = async id => {
    try {
      const response = await authFetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        message.success('Job deleted');
        getJobs();
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  const activeJobsCount = jobs.filter(
    j => j.isActive && j.deadline >= getToday()
  ).length;
  const totalApplicantsCount = jobs.reduce(
    (acc, j) => acc + (j.applicantCount || 0),
    0
  );

  return (
    <div className="recruiter-dashboard">
      <div className="dashboard-top">
        <div>
          <h1>Recruiter Workspace</h1>
          <p className="dashboard-subtitle">
            Manage your open postings, track candidates, and make hiring decisions.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<Plus size={16} />}
          onClick={() => navigate('/post-job')}
          className="post-job-cta"
        >
          Post New Job
        </Button>
      </div>

      <div className="dashboard-stats-strip">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-total">
            <Briefcase size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{jobs.length}</span>
            <span className="stat-label">Total Postings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-shortlisted">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeJobsCount}</span>
            <span className="stat-label">Active Listings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-reviewed">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalApplicantsCount}</span>
            <span className="stat-label">Total Applicants</span>
          </div>
        </div>
      </div>

      <div className="job-list-section-header">
        <h2>Your Job Listings ({jobs.length})</h2>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-jobs-card">
          <Empty description="You have not posted any job vacancies yet">
            <p className="empty-subtext">Publish your first job posting to start receiving candidates.</p>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={16} />}
              onClick={() => navigate('/post-job')}
            >
              Post your first job
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map(job => {
            const status = getJobStatus(job);

            return (
              <Card key={job.id} className="my-job-card">
                <div className="my-job-header">
                  <div>
                    <div className="my-job-company-row">
                      <div className="company-badge-small">
                        <Building2 size={14} />
                      </div>
                      <span className="my-job-company">{job.company}</span>
                    </div>
                    <h3 className="my-job-title">{job.title}</h3>
                  </div>
                  <Tag color={status.color} className="job-status-pill">
                    {status.label.toUpperCase()}
                  </Tag>
                </div>

                <div className="my-job-meta-grid">
                  <span className="my-job-info">
                    <MapPin size={14} className="meta-icon" /> {job.location}
                  </span>
                  <Tag className="job-type-pill">{job.type}</Tag>
                  <span className="my-job-info">
                    <CalendarDays size={14} className="meta-icon" /> Deadline:{' '}
                    {formatDate(job.deadline)}
                  </span>
                  <span className="my-job-info applicant-highlight">
                    <Users size={14} className="meta-icon" />
                    <strong>{job.applicantCount}</strong>{' '}
                    {job.applicantCount === 1 ? 'candidate' : 'candidates'}
                  </span>
                </div>

                <div className="my-job-actions">
                  <Button
                    type="primary"
                    icon={<Eye size={15} />}
                    onClick={() => navigate(`/applicants/${job.id}`)}
                  >
                    View Applicants ({job.applicantCount})
                  </Button>
                  <Button
                    icon={<SquarePen size={14} />}
                    onClick={() => navigate(`/edit-job/${job.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    icon={<Power size={14} />}
                    onClick={() => onToggleActive(job)}
                  >
                    {job.isActive ? 'Close Job' : 'Reopen Job'}
                  </Button>
                  <Popconfirm
                    title="Delete this job?"
                    description="All applications for it will be deleted too."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => onDelete(job.id)}
                  >
                    <Button danger icon={<Trash2 size={14} />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
