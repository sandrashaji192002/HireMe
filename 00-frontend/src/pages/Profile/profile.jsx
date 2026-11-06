import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Avatar, Tag, Spin, message } from 'antd';
import {
  User,
  Plus,
  Trash2,
  FileText,
  SquarePen,
  MapPin,
  Mail,
  GraduationCap,
  Briefcase,
  ExternalLink,
  UploadCloud,
  Sparkles,
  Save,
  X,
} from 'lucide-react';
import { authFetch, fileUrl } from '../../utils/api';
import { useAuth } from '../../context/auth-context';
import './profile.css';

const emptyEducation = { school: '', degree: '', year: '' };
const emptyExperience = {
  company: '',
  role: '',
  from: '',
  to: '',
  description: '',
};

const cleanList = list =>
  Array.isArray(list)
    ? list.filter(i => i && typeof i === 'object' && !Array.isArray(i))
    : [];

const buildForm = u => ({
  name: u.name || '',
  bio: u.bio || '',
  location: u.location || '',
  githubUrl: u.githubUrl || '',
  linkedinUrl: u.linkedinUrl || '',
  skills: Array.isArray(u.skills) ? u.skills : [],
  education: cleanList(u.education),
  experience: cleanList(u.experience),
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getProfile = async () => {
    try {
      const response = await authFetch('/api/auth/me');
      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    getProfile();
  }, []);

  const onEdit = () => {
    setForm(buildForm(profile));
    setEditing(true);
  };

  const onCancel = () => {
    setEditing(false);
  };

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSkillsChange = values => {
    setForm({ ...form, skills: values });
  };

  const updateItem = (listName, index, field, value) => {
    const list = form[listName].map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setForm({ ...form, [listName]: list });
  };

  const addItem = (listName, emptyItem) => {
    setForm({ ...form, [listName]: [...form[listName], { ...emptyItem }] });
  };

  const removeItem = (listName, index) => {
    setForm({
      ...form,
      [listName]: form[listName].filter((_, i) => i !== index),
    });
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      message.error('Name cannot be empty');
      return;
    }

    const isFilled = item =>
      Object.values(item).some(v => String(v).trim() !== '');

    const body = {
      ...form,
      name: form.name.trim(),
      education: form.education.filter(isFilled),
      experience: form.experience.filter(isFilled),
    };

    setSaving(true);
    try {
      const response = await authFetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('Profile updated successfully');
        setProfile(data.user);
        updateUser({ ...user, name: data.user.name });
        setEditing(false);
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setSaving(false);
  };

  const onResumeChange = async e => {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      message.error('Only PDF files are allowed');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('File must be smaller than 5 MB');
      input.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await authFetch('/api/profile/resume', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setProfile({ ...profile, resumeUrl: data.resumeUrl });
        message.success('Resume uploaded successfully');
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    input.value = '';
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }
  if (!profile) return null;

  const education = cleanList(profile.education);
  const experience = cleanList(profile.experience);
  const skills = Array.isArray(profile.skills) ? profile.skills : [];

  return (
    <div className="profile-page">
      <div className="profile-hero-card">
        <div className="profile-hero-content">
          <Avatar
            size={84}
            src={fileUrl(user.profileImageUrl)}
            icon={<User size={38} />}
            className="profile-hero-avatar"
          />
          <div className="profile-hero-info">
            <h2>{profile.name}</h2>
            <div className="profile-hero-metas">
              <span className="profile-meta-item">
                <Mail size={14} />
                <span>{profile.email}</span>
              </span>
              {profile.location && (
                <span className="profile-meta-item">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {!editing && (
          <Button
            type="primary"
            icon={<SquarePen size={15} />}
            onClick={onEdit}
            className="edit-profile-btn"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Card
        title={
          <span className="card-title-group">
            <FileText size={18} className="card-title-icon" />
            <span>Resume & Documents</span>
          </span>
        }
        className="profile-card"
      >
        <div className="resume-section-content">
          {profile.resumeUrl ? (
            <div className="current-resume-box">
              <FileText size={20} className="pdf-icon" />
              <div className="resume-info">
                <strong>Current Resume Attached</strong>
                <a
                  href={fileUrl(profile.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="resume-download-link"
                >
                  <span>View / Download Resume (PDF)</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div className="no-resume-box">
              <p>No resume uploaded yet. Upload a PDF resume so employers can evaluate your background.</p>
            </div>
          )}

          <div className="resume-upload-row">
            <label htmlFor="resume-file-input" className="resume-upload-button">
              <UploadCloud size={16} />
              <span>
                {profile.resumeUrl ? 'Upload New Resume (PDF, max 5 MB)' : 'Upload Resume (PDF, max 5 MB)'}
              </span>
            </label>
            <input
              id="resume-file-input"
              type="file"
              accept="application/pdf"
              className="resume-hidden-input"
              onChange={onResumeChange}
            />
            {uploading && <Spin size="small" />}
          </div>
        </div>
      </Card>

      {!editing ? (
        <>
          <Card
            title={
              <span className="card-title-group">
                <User size={18} className="card-title-icon" />
                <span>About & Links</span>
              </span>
            }
            className="profile-card"
          >
            <div className="about-fields-grid">
              <div className="about-field">
                <span className="field-label">Bio:</span>
                <p className="field-value">{profile.bio || 'No bio added yet'}</p>
              </div>

              <div className="about-field">
                <span className="field-label">Location:</span>
                <p className="field-value">{profile.location || 'Not specified'}</p>
              </div>

              <div className="about-field">
                <span className="field-label">GitHub:</span>
                <div className="field-value">
                  {profile.githubUrl ? (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="external-profile-link"
                    >
                      <span>{profile.githubUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    'Not added'
                  )}
                </div>
              </div>

              <div className="about-field">
                <span className="field-label">LinkedIn:</span>
                <div className="field-value">
                  {profile.linkedinUrl ? (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="external-profile-link"
                    >
                      <span>{profile.linkedinUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    'Not added'
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card
            title={
              <span className="card-title-group">
                <Sparkles size={18} className="card-title-icon" />
                <span>Skills & Tech Stack</span>
              </span>
            }
            className="profile-card"
          >
            {skills.length === 0 ? (
              <p className="empty-section-text">No skills added yet</p>
            ) : (
              <div className="profile-skills-grid">
                {skills.map(skill => (
                  <Tag key={skill} className="profile-skill-chip">
                    {skill}
                  </Tag>
                ))}
              </div>
            )}
          </Card>

          <Card
            title={
              <span className="card-title-group">
                <GraduationCap size={18} className="card-title-icon" />
                <span>Education</span>
              </span>
            }
            className="profile-card"
          >
            {education.length === 0 ? (
              <p className="empty-section-text">No education added yet</p>
            ) : (
              <div className="timeline-items-list">
                {education.map((item, index) => (
                  <div className="timeline-card" key={index}>
                    <div className="timeline-badge-icon">
                      <GraduationCap size={15} />
                    </div>
                    <div className="timeline-body">
                      <strong className="timeline-title">{item.degree}</strong>
                      <p className="timeline-sub">
                        {item.school}
                        {item.year ? ` · Class of ${item.year}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title={
              <span className="card-title-group">
                <Briefcase size={18} className="card-title-icon" />
                <span>Work Experience</span>
              </span>
            }
            className="profile-card"
          >
            {experience.length === 0 ? (
              <p className="empty-section-text">No experience added yet</p>
            ) : (
              <div className="timeline-items-list">
                {experience.map((item, index) => (
                  <div className="timeline-card" key={index}>
                    <div className="timeline-badge-icon">
                      <Briefcase size={15} />
                    </div>
                    <div className="timeline-body">
                      <strong className="timeline-title">{item.role}</strong>
                      <p className="timeline-sub">
                        {item.company}
                        {item.from
                          ? ` · ${item.from} to ${item.to || 'Present'}`
                          : ''}
                      </p>
                      {item.description && (
                        <p className="timeline-desc">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <div className="profile-edit-mode">
          <Card
            title={
              <span className="card-title-group">
                <User size={18} className="card-title-icon" />
                <span>Basic Information</span>
              </span>
            }
            className="profile-card"
          >
            <div className="input-item">
              <label>Full Name:</label>
              <Input name="name" size="large" value={form.name} onChange={onChange} />
            </div>
            <div className="input-item">
              <label>Professional Bio:</label>
              <Input.TextArea
                name="bio"
                rows={4}
                placeholder="Tell recruiters about your background, strengths, and goals..."
                value={form.bio}
                onChange={onChange}
              />
            </div>
            <div className="input-item">
              <label>Location:</label>
              <Input
                name="location"
                placeholder="e.g. San Francisco, CA"
                size="large"
                value={form.location}
                onChange={onChange}
              />
            </div>
            <div className="input-item">
              <label>GitHub Profile URL:</label>
              <Input
                name="githubUrl"
                placeholder="https://github.com/yourusername"
                size="large"
                value={form.githubUrl}
                onChange={onChange}
              />
            </div>
            <div className="input-item">
              <label>LinkedIn Profile URL:</label>
              <Input
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/yourusername"
                size="large"
                value={form.linkedinUrl}
                onChange={onChange}
              />
            </div>
          </Card>

          <Card
            title={
              <span className="card-title-group">
                <Sparkles size={18} className="card-title-icon" />
                <span>Skills</span>
              </span>
            }
            className="profile-card"
          >
            <Select
              mode="tags"
              size="large"
              style={{ width: '100%' }}
              placeholder="Type a skill and press Enter"
              value={form.skills}
              onChange={onSkillsChange}
              open={false}
            />
          </Card>

          <Card
            title={
              <span className="card-title-group">
                <GraduationCap size={18} className="card-title-icon" />
                <span>Education</span>
              </span>
            }
            className="profile-card"
          >
            <div className="edit-list-items">
              {form.education.map((item, index) => (
                <div className="list-row" key={index}>
                  <Input
                    placeholder="School / College"
                    value={item.school || ''}
                    onChange={e =>
                      updateItem('education', index, 'school', e.target.value)
                    }
                  />
                  <Input
                    placeholder="Degree"
                    value={item.degree || ''}
                    onChange={e =>
                      updateItem('education', index, 'degree', e.target.value)
                    }
                  />
                  <Input
                    placeholder="Year"
                    style={{ maxWidth: 100 }}
                    value={item.year || ''}
                    onChange={e =>
                      updateItem('education', index, 'year', e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem('education', index)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <Button
              icon={<Plus size={14} />}
              onClick={() => addItem('education', emptyEducation)}
              className="add-subitem-btn"
            >
              Add Education
            </Button>
          </Card>

          <Card
            title={
              <span className="card-title-group">
                <Briefcase size={18} className="card-title-icon" />
                <span>Experience</span>
              </span>
            }
            className="profile-card"
          >
            <div className="edit-list-items">
              {form.experience.map((item, index) => (
                <div className="experience-box" key={index}>
                  <div className="list-row">
                    <Input
                      placeholder="Company"
                      value={item.company || ''}
                      onChange={e =>
                        updateItem('experience', index, 'company', e.target.value)
                      }
                    />
                    <Input
                      placeholder="Role"
                      value={item.role || ''}
                      onChange={e =>
                        updateItem('experience', index, 'role', e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem('experience', index)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="list-row">
                    <Input
                      type="month"
                      value={item.from || ''}
                      onChange={e =>
                        updateItem('experience', index, 'from', e.target.value)
                      }
                    />
                    <Input
                      type="month"
                      value={item.to || ''}
                      onChange={e =>
                        updateItem('experience', index, 'to', e.target.value)
                      }
                    />
                  </div>
                  <Input.TextArea
                    rows={2}
                    placeholder="Briefly summarize your key responsibilities and achievements..."
                    value={item.description || ''}
                    onChange={e =>
                      updateItem(
                        'experience',
                        index,
                        'description',
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <Button
              icon={<Plus size={14} />}
              onClick={() => addItem('experience', emptyExperience)}
              className="add-subitem-btn"
            >
              Add Experience
            </Button>
            <p className="hint">Leave the second date empty if you currently work here.</p>
          </Card>

          <div className="edit-buttons">
            <Button
              type="primary"
              size="large"
              loading={saving}
              icon={<Save size={16} />}
              onClick={onSave}
              className="save-profile-btn"
            >
              Save Profile
            </Button>
            <Button size="large" icon={<X size={16} />} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
