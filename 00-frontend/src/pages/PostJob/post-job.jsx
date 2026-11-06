import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Select, Button, Spin, message } from 'antd';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { authFetch } from '../../utils/api';
import { useAuth } from '../../context/auth-context';
import { JOB_TYPES } from '../../utils/constants';
import { getToday } from '../../utils/helpers';
import './post-job.css';

const emptyForm = {
  title: '',
  company: '',
  location: '',
  type: '',
  description: '',
  skillsRequired: [],
  deadline: '',
};

const PostJob = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [originalDeadline, setOriginalDeadline] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setForm(emptyForm);
      setLoading(false);
      return;
    }

    const getJob = async () => {
      setLoading(true);
      try {
        const response = await authFetch(`/api/jobs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          message.error(data.message);
          navigate('/dashboard');
          return;
        }

        const job = data.job;
        if (job.recruiterId !== user.id) {
          message.error('You can only edit your own jobs');
          navigate('/dashboard');
          return;
        }

        setForm({
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          description: job.description,
          skillsRequired: job.skillsRequired || [],
          deadline: job.deadline,
        });
        setOriginalDeadline(job.deadline);
      } catch (e) {
        message.error('Cannot connect to server');
      }
      setLoading(false);
    };

    getJob();
  }, [id]);

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onTypeChange = value => {
    setForm({ ...form, type: value });
  };

  const onSkillsChange = values => {
    setForm({ ...form, skillsRequired: values });
  };

  const onClick = async () => {
    if (
      !form.title.trim() ||
      !form.company.trim() ||
      !form.location.trim() ||
      !form.type ||
      !form.description.trim() ||
      !form.deadline
    ) {
      message.error('Please fill all the required fields');
      return;
    }

    const body = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      type: form.type,
      description: form.description.trim(),
      skillsRequired: form.skillsRequired,
    };

    if (!id || form.deadline !== originalDeadline) {
      if (form.deadline < getToday()) {
        message.error('Deadline cannot be in the past');
        return;
      }
      body.deadline = form.deadline;
    }

    setSaving(true);
    try {
      const response = await authFetch(id ? `/api/jobs/${id}` : '/api/jobs', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        message.success(id ? 'Job updated successfully' : 'Job posted successfully');
        navigate('/dashboard');
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="post-job-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="post-job-page">
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/dashboard')}
        className="back-btn"
      >
        Back to Dashboard
      </Button>

      <div className="post-job-card">
        <div className="post-job-header">
          <div className="header-icon-box">
            <Sparkles size={20} />
          </div>
          <div>
            <h2>{id ? 'Edit Job Posting' : 'Post a New Job Opportunity'}</h2>
            <p>Reach qualified applicants with a detailed job description.</p>
          </div>
        </div>

        <div className="post-job-form">
          <div className="input-item">
            <label>
              Job Title <span className="required">*</span>
            </label>
            <Input
              name="title"
              placeholder="e.g. Senior Frontend Engineer"
              prefix={<Briefcase size={16} className="input-icon" />}
              value={form.title}
              onChange={onChange}
              size="large"
            />
          </div>

          <div className="form-row-2">
            <div className="input-item">
              <label>
                Company Name <span className="required">*</span>
              </label>
              <Input
                name="company"
                placeholder="e.g. Acme Labs"
                prefix={<Building2 size={16} className="input-icon" />}
                value={form.company}
                onChange={onChange}
                size="large"
              />
            </div>

            <div className="input-item">
              <label>
                Location <span className="required">*</span>
              </label>
              <Input
                name="location"
                placeholder="e.g. San Francisco, CA / Remote"
                prefix={<MapPin size={16} className="input-icon" />}
                value={form.location}
                onChange={onChange}
                size="large"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="input-item">
              <label>
                Employment Type <span className="required">*</span>
              </label>
              <Select
                placeholder="Select job type"
                size="large"
                value={form.type || undefined}
                onChange={onTypeChange}
                options={JOB_TYPES.map(type => ({
                  value: type,
                  label: <span style={{ textTransform: 'capitalize' }}>{type}</span>,
                }))}
              />
            </div>

            <div className="input-item">
              <label>
                Application Deadline <span className="required">*</span>
              </label>
              <Input
                type="date"
                name="deadline"
                size="large"
                min={getToday()}
                value={form.deadline}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="input-item">
            <label>
              Job Description <span className="required">*</span>
            </label>
            <Input.TextArea
              name="description"
              rows={6}
              placeholder="Outline the responsibilities, qualifications, tech stack, and benefits..."
              value={form.description}
              onChange={onChange}
            />
          </div>

          <div className="input-item">
            <label>Required Skills & Technologies:</label>
            <Select
              mode="tags"
              size="large"
              placeholder="Type a skill (e.g. React, Node.js) and press Enter"
              value={form.skillsRequired}
              onChange={onSkillsChange}
              open={false}
            />
          </div>

          <div className="post-job-actions">
            <Button
              type="primary"
              size="large"
              loading={saving}
              icon={<Save size={16} />}
              onClick={onClick}
              className="submit-post-btn"
            >
              {id ? 'Save Changes' : 'Publish Job Listing'}
            </Button>
            <Button size="large" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
