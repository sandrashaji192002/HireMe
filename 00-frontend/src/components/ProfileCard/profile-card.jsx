import { Avatar, Tag } from 'antd';
import {
  User,
  MapPin,
  FileText,
  Mail,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Download,
} from 'lucide-react';
import { fileUrl } from '../../utils/api';
import './profile-card.css';

const cleanList = list =>
  Array.isArray(list)
    ? list.filter(i => i && typeof i === 'object' && !Array.isArray(i))
    : [];

const ProfileCard = ({ student }) => {
  const skills = Array.isArray(student.skills) ? student.skills : [];
  const education = cleanList(student.education);
  const experience = cleanList(student.experience);

  return (
    <div className="profile-summary">
      <div className="summary-top">
        <Avatar
          size={60}
          src={fileUrl(student.profileImageUrl)}
          icon={<User size={28} />}
          className="applicant-summary-avatar"
        />
        <div className="summary-top-info">
          <h3 className="applicant-name">{student.name}</h3>
          <p className="summary-line">
            <Mail size={13} className="meta-icon" />
            <span>{student.email}</span>
          </p>
          {student.location && (
            <p className="summary-line">
              <MapPin size={13} className="meta-icon" />
              <span>{student.location}</span>
            </p>
          )}
        </div>
      </div>

      {student.bio && (
        <div className="summary-bio-box">
          <p className="summary-bio">{student.bio}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="summary-section">
          <span className="summary-section-label">Skills & Competencies</span>
          <div className="summary-skills-wrap">
            {skills.map(skill => (
              <Tag className="applicant-skill-tag" key={skill}>
                {skill}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="summary-section">
          <div className="section-title-row">
            <GraduationCap size={15} className="section-icon" />
            <span className="summary-section-label">Education</span>
          </div>
          <div className="summary-list">
            {education.map((item, index) => (
              <div className="summary-list-item" key={index}>
                <span className="item-primary">{item.degree}</span>
                <span className="item-secondary">
                  {item.school}
                  {item.year ? ` · ${item.year}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="summary-section">
          <div className="section-title-row">
            <Briefcase size={15} className="section-icon" />
            <span className="summary-section-label">Experience</span>
          </div>
          <div className="summary-list">
            {experience.map((item, index) => (
              <div className="summary-list-item" key={index}>
                <span className="item-primary">{item.role}</span>
                <span className="item-secondary">
                  {item.company}
                  {item.from ? ` · ${item.from} to ${item.to || 'Present'}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="summary-links">
        {student.githubUrl && (
          <a
            href={student.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="link-pill"
          >
            <span>GitHub Profile</span>
            <ExternalLink size={12} />
          </a>
        )}
        {student.linkedinUrl && (
          <a
            href={student.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="link-pill"
          >
            <span>LinkedIn Profile</span>
            <ExternalLink size={12} />
          </a>
        )}
        {student.resumeUrl ? (
          <a
            href={fileUrl(student.resumeUrl)}
            target="_blank"
            rel="noreferrer"
            className="link-pill resume-pill"
          >
            <Download size={13} />
            <span>Download Resume</span>
          </a>
        ) : (
          <span className="no-resume-badge">No resume attached</span>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
