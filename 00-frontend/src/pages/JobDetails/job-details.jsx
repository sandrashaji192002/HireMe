import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Spin, Avatar, message } from 'antd';
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  User,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { authFetch, fileUrl } from '../../utils/api';
import { formatDate, getToday } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';
import ApplyModal from '../../components/ApplyModal/apply-modal';
import './job-details.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const getData = async () => {
    try {
      const jobResponse = await authFetch(`/api/jobs/${id}`);
      const jobData = await jobResponse.json();
      if (!jobResponse.ok) {
        message.error(jobData.message);
        navigate('/jobs');
        return;
      }
      setJob(jobData.job);

      const appResponse = await authFetch('/api/applications/my');
      const appData = await appResponse.json();
      if (appResponse.ok) {
        const found = appData.applications.find(
          a => a.jobId === jobData.job.id
        );
        setApplication(found || null);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [id]);

  const onApplied = () => {
    setModalOpen(false);
    getData();
  };

  if (loading) {
    return (
      <div className="job-details-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!job) return null;

  const isClosed = !job.isActive || job.deadline < getToday();

  return (
    <div className="job-details-page">
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/jobs')}
        className="back-btn"
      >
        Back to all jobs
      </Button>

      <div className="job-details-header-card">
        <div className="header-meta-row">
          <div className="company-badge-group">
            <div className="company-icon-circle">
              <Building2 size={18} />
            </div>
            <span className="detail-company">{job.company}</span>
          </div>
          <Tag className="job-type-pill">{job.type}</Tag>
        </div>

        <h1 className="detail-title">{job.title}</h1>

        <div className="detail-meta-row">
          <span className="detail-meta-item">
            <MapPin size={15} className="meta-icon" />
            <span>{job.location}</span>
          </span>
          <span className="detail-meta-item">
            <CalendarDays size={15} className="meta-icon" />
            <span>Deadline: {formatDate(job.deadline)}</span>
          </span>
        </div>
      </div>

      <div className="job-details-grid">
        <div className="job-main-column">
          <div className="details-section-card">
            <h3>Role Description</h3>
            <div className="detail-description">{job.description}</div>
          </div>

          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="details-section-card">
              <h3>Required Skills & Technologies</h3>
              <div className="detail-skills-wrap">
                {job.skillsRequired.map(skill => (
                  <Tag key={skill} className="detail-skill-tag">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="job-sidebar-column">
          <div className="details-sidebar-card action-card">
            <h3>Application Status</h3>

            {application ? (
              <div className="applied-status-box">
                <CheckCircle2 size={24} className="status-success-icon" />
                <div className="status-text-wrap">
                  <strong>Application Submitted</strong>
                  <p>Current Status:</p>
                  <Tag color={STATUS_COLORS[application.status]} className="status-pill-large">
                    {application.status.toUpperCase()}
                  </Tag>
                </div>
              </div>
            ) : isClosed ? (
              <div className="closed-status-box">
                <AlertCircle size={24} className="status-closed-icon" />
                <div>
                  <strong>Applications Closed</strong>
                  <p>This job is no longer accepting new applicants.</p>
                </div>
              </div>
            ) : (
              <div className="apply-cta-box">
                <p>Interested in joining {job.company}? Submit your profile to get in front of the hiring team.</p>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<Sparkles size={16} />}
                  onClick={() => setModalOpen(true)}
                  className="apply-now-btn"
                >
                  Apply Now
                </Button>
              </div>
            )}
          </div>

          {job.recruiter && (
            <div className="details-sidebar-card recruiter-card">
              <h3>Hiring Lead</h3>
              <div className="recruiter-profile-row">
                <Avatar
                  size={48}
                  src={fileUrl(job.recruiter.profileImageUrl)}
                  icon={<User size={22} />}
                  className="recruiter-avatar"
                />
                <div className="recruiter-info">
                  <span className="recruiter-name">{job.recruiter.name}</span>
                  <span className="recruiter-role">Job Creator · Recruiter</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApplyModal
        open={modalOpen}
        jobId={job.id}
        jobTitle={job.title}
        onClose={() => setModalOpen(false)}
        onApplied={onApplied}
      />
    </div>
  );
};

export default JobDetails;
