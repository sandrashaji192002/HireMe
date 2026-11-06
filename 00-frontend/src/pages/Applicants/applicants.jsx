import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Button,
  Select,
  Spin,
  Empty,
  Popconfirm,
  message,
} from 'antd';
import {
  ArrowLeft,
  Calendar,
  MessageSquareQuote,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
} from 'lucide-react';
import { authFetch } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { STATUS_COLORS, NEXT_STATUS } from '../../utils/constants';
import ProfileCard from '../../components/ProfileCard/profile-card';
import StatusSteps from '../../components/StatusSteps/status-steps';
import './applicants.css';

const BUTTON_TEXT = {
  reviewed: 'Mark as Reviewed',
  shortlisted: 'Shortlist Candidate',
  rejected: 'Reject Application',
};

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const getApplicants = async () => {
      try {
        const response = await authFetch(`/api/applications/job/${jobId}`);
        const data = await response.json();

        if (response.ok) {
          setJob(data.job);
          setApplications(data.applications);
        } else {
          message.error(data.message);
          navigate('/dashboard');
          return;
        }
      } catch (e) {
        message.error('Cannot connect to server');
      }
      setLoading(false);
    };

    getApplicants();
  }, [jobId]);

  const onStatusChange = async (app, newStatus) => {
    setUpdatingId(app.id);
    try {
      const response = await authFetch(`/api/applications/${app.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (response.ok) {
        message.success(`${app.student.name} is now marked as ${newStatus}`);
        setApplications(
          applications.map(a =>
            a.id === app.id ? { ...a, status: newStatus } : a
          )
        );
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="applicants-loading">
        <Spin size="large" />
      </div>
    );
  }

  const visible = filter
    ? applications.filter(a => a.status === filter)
    : applications;

  return (
    <div className="applicants-page">
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/dashboard')}
        className="back-btn"
      >
        Back to my jobs
      </Button>

      <div className="applicants-top-header">
        <div>
          <div className="job-company-badge">
            <Building2 size={15} />
            <span>{job?.company}</span>
          </div>
          <h2>Candidates for {job?.title}</h2>
          <p className="applicants-subtitle">
            Review applicant qualifications, cover notes, and progress stages.
          </p>
        </div>

        <div className="applicants-filter-control">
          <Select
            placeholder="Filter by status"
            allowClear
            size="large"
            style={{ minWidth: 170 }}
            value={filter || undefined}
            onChange={value => setFilter(value || '')}
            options={Object.keys(NEXT_STATUS).map(s => ({
              value: s,
              label: (
                <span style={{ textTransform: 'capitalize' }}>
                  {s} ({applications.filter(a => a.status === s).length})
                </span>
              ),
            }))}
          />
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-applicants-box">
          <Empty description="No candidates have applied to this job yet">
            <p className="empty-subtext">
              Share your job link or check back soon.
            </p>
          </Empty>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-applicants-box">
          <Empty description={`No candidates found with status "${filter}"`}>
            <Button onClick={() => setFilter('')}>Clear Status Filter</Button>
          </Empty>
        </div>
      ) : (
        <div className="applicant-list">
          {visible.map(app => (
            <Card key={app.id} className="applicant-card">
              <div className="applicant-card-header">
                <span className="applicant-date">
                  <Calendar size={13} />
                  <span>Applied on {formatDate(app.createdAt)}</span>
                </span>
                <Tag
                  color={STATUS_COLORS[app.status]}
                  className="applicant-status-tag"
                >
                  {app.status.toUpperCase()}
                </Tag>
              </div>

              <ProfileCard student={app.student} />

              {app.coverNote ? (
                <div className="cover-note-box">
                  <div className="cover-note-header">
                    <MessageSquareQuote size={16} className="quote-icon" />
                    <strong>Cover Note from Applicant:</strong>
                  </div>
                  <p className="cover-note-text">{app.coverNote}</p>
                </div>
              ) : null}

              <StatusSteps status={app.status} />

              <div className="status-action-footer">
                {NEXT_STATUS[app.status].length === 0 ? (
                  <span className="final-status-badge">
                    Final stage reached: <strong>{app.status}</strong>
                  </span>
                ) : (
                  <div className="status-buttons-row">
                    {NEXT_STATUS[app.status].map(next =>
                      next === 'rejected' ? (
                        <Popconfirm
                          key={next}
                          title="Reject this applicant?"
                          description="This candidate will be notified that they were not selected."
                          okText="Reject"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => onStatusChange(app, next)}
                        >
                          <Button
                            danger
                            icon={<XCircle size={15} />}
                            loading={updatingId === app.id}
                          >
                            {BUTTON_TEXT[next]}
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Button
                          key={next}
                          type="primary"
                          icon={
                            next === 'shortlisted' ? (
                              <CheckCircle size={15} />
                            ) : (
                              <Clock size={15} />
                            )
                          }
                          loading={updatingId === app.id}
                          onClick={() => onStatusChange(app, next)}
                        >
                          {BUTTON_TEXT[next]}
                        </Button>
                      )
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;
