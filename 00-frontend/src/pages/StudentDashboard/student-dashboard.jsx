import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Tag, Spin, Empty, Button, message, notification } from 'antd';
import {
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { authFetch } from '../../utils/api';
import { useAuth } from '../../context/auth-context';
import { formatDate } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';
import StatusSteps from '../../components/StatusSteps/status-steps';
import './student-dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const storageKey = `statuses-${user.id}`;
  const previousStatus = useRef(JSON.parse(localStorage.getItem(storageKey)));

  const getApplications = async () => {
    try {
      const response = await authFetch('/api/applications/my');
      const data = await response.json();

      if (!response.ok) {
        if (previousStatus.current === null) message.error(data.message);
        return;
      }

      if (previousStatus.current) {
        data.applications.forEach(app => {
          const oldStatus = previousStatus.current[app.id];
          if (oldStatus && oldStatus !== app.status) {
            notification.info({
              message: 'Application update',
              description: `${app.job.title} at ${app.job.company}: ${oldStatus} → ${app.status}`,
            });
          }
        });
      }

      const statusMap = {};
      data.applications.forEach(app => {
        statusMap[app.id] = app.status;
      });
      previousStatus.current = statusMap;
      localStorage.setItem(storageKey, JSON.stringify(statusMap));

      setApplications(data.applications);
    } catch (e) {
      if (previousStatus.current === null)
        message.error('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApplications();
    const timer = setInterval(getApplications, 20000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  const reviewedCount = applications.filter(a => a.status === 'reviewed').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;

  return (
    <div className="student-dashboard">
      <div className="dashboard-hero">
        <div className="welcome-tag">
          <Sparkles size={14} />
          <span>Student Candidate Portal</span>
        </div>
        <h1>Welcome, {user.name}</h1>
        <p>Track your job submissions, application statuses, and interview reviews.</p>
      </div>

      <div className="dashboard-stats-strip">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-total">
            <FileText size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{applications.length}</span>
            <span className="stat-label">Total Applied</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-reviewed">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{reviewedCount}</span>
            <span className="stat-label">In Review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-shortlisted">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{shortlistedCount}</span>
            <span className="stat-label">Shortlisted</span>
          </div>
        </div>
      </div>

      <div className="applications-section-header">
        <h2>My Applications</h2>
        <Button
          type="primary"
          icon={<Briefcase size={15} />}
          onClick={() => navigate('/jobs')}
        >
          Browse More Jobs
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="empty-applications-card">
          <Empty description="You have not applied to any job yet">
            <p className="empty-subtext">Explore current listings and start applying today!</p>
            <Button type="primary" size="large" onClick={() => navigate('/jobs')}>
              Browse Open Jobs
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="application-list">
          {applications.map(app => (
            <Card key={app.id} className="application-card">
              <div className="application-card-top">
                <div className="application-info-block">
                  <div className="app-company-row">
                    <span className="app-company-name">{app.job.company}</span>
                    <span className="app-dot">·</span>
                    <span className="app-location">
                      <MapPin size={13} /> {app.job.location}
                    </span>
                  </div>
                  <h3 className="app-job-title">
                    <Link to={`/jobs/${app.job.id}`} className="job-title-link">
                      <span>{app.job.title}</span>
                      <ArrowUpRight size={16} className="title-arrow" />
                    </Link>
                  </h3>
                </div>

                <Tag color={STATUS_COLORS[app.status]} className="status-tag-badge">
                  {app.status.toUpperCase()}
                </Tag>
              </div>

              <div className="application-card-meta">
                <span className="applied-date-text">
                  <Calendar size={13} />
                  <span>Submitted on {formatDate(app.createdAt)}</span>
                </span>
              </div>

              <StatusSteps status={app.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
