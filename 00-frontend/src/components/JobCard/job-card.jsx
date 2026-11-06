import { useNavigate } from 'react-router-dom';
import { Card, Tag } from 'antd';
import { MapPin, CalendarDays, Building2, ArrowUpRight } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import './job-card.css';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      className="job-card"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <div className="job-card-top">
        <div className="job-company-row">
          <div className="company-icon-badge">
            <Building2 size={15} />
          </div>
          <span className="job-company">{job.company}</span>
        </div>
        <Tag className="job-type-badge">{job.type}</Tag>
      </div>

      <h3 className="job-title">{job.title}</h3>

      <div className="job-meta-list">
        <span className="job-info">
          <MapPin size={14} className="meta-icon" />
          <span>{job.location}</span>
        </span>
        <span className="job-info">
          <CalendarDays size={14} className="meta-icon" />
          <span>Deadline: {formatDate(job.deadline)}</span>
        </span>
      </div>

      {job.skillsRequired && job.skillsRequired.length > 0 && (
        <div className="job-tags">
          {job.skillsRequired.slice(0, 4).map(skill => (
            <Tag key={skill} className="skill-chip">
              {skill}
            </Tag>
          ))}
          {job.skillsRequired.length > 4 && (
            <Tag className="skill-chip more-chip">+{job.skillsRequired.length - 4}</Tag>
          )}
        </div>
      )}

      <div className="job-card-footer">
        <span className="view-details-text">View Position</span>
        <div className="view-arrow-btn">
          <ArrowUpRight size={15} />
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
