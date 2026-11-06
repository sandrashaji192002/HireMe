import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Select, Button, message } from 'antd';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  UploadCloud,
  ArrowRight,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { API_URL } from '../../utils/api';
import './register.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onRoleChange = value => {
    setForm({ ...form, role: value });
  };

  const onImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const onClick = async () => {
    if (!form.name || !form.email || !form.password) {
      message.error('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      if (image) {
        formData.append('profileImage', image);
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        message.success('Registered successfully! Please sign in');
        navigate('/login');
      } else {
        message.error(data.message || 'Registration failed');
      }
    } catch (e) {
      message.error('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <div className="auth-brand-badge">
          <div className="auth-brand-icon">
            <Sparkles size={22} />
          </div>
          <span className="auth-brand-name">
            Hire<span className="brand-highlight">Me</span>
          </span>
        </div>

        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join HireMe today as a candidate or recruiter</p>
        </div>

        <div className="register-form">
          <div className="input-item">
            <label>
              Full Name <span className="required">*</span>
            </label>
            <Input
              name="name"
              prefix={<User size={16} className="input-icon" />}
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={onChange}
              size="large"
            />
          </div>

          <div className="input-item">
            <label>
              Email Address <span className="required">*</span>
            </label>
            <Input
              name="email"
              prefix={<Mail size={16} className="input-icon" />}
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              size="large"
            />
          </div>

          <div className="input-item">
            <label>
              Password <span className="required">*</span>
            </label>
            <Input.Password
              name="password"
              prefix={<Lock size={16} className="input-icon" />}
              placeholder="Create strong password"
              value={form.password}
              onChange={onChange}
              size="large"
            />
            <small className="password-hint">
              Min 6 chars, 1 capital letter, 1 number, 1 special character
            </small>
          </div>

          <div className="input-item">
            <label>
              Confirm Password <span className="required">*</span>
            </label>
            <Input.Password
              name="confirmPassword"
              prefix={<Lock size={16} className="input-icon" />}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={onChange}
              size="large"
            />
          </div>

          <div className="input-item">
            <label>I want to join as:</label>
            <Select
              size="large"
              value={form.role}
              onChange={onRoleChange}
              options={[
                {
                  value: 'student',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <GraduationCap size={16} /> Student / Job Seeker
                    </span>
                  ),
                },
                {
                  value: 'recruiter',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Briefcase size={16} /> Recruiter / Employer
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div className="input-item">
            <label>Profile Photo (optional):</label>
            <div className="file-upload-box">
              <input
                type="file"
                id="profile-photo-input"
                className="file-hidden-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={onImageChange}
              />
              <label htmlFor="profile-photo-input" className="file-upload-label">
                {imagePreview ? (
                  <div className="upload-preview-wrapper">
                    <img src={imagePreview} alt="Preview" className="upload-preview-img" />
                    <span>{image?.name || 'Change selected photo'}</span>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <UploadCloud size={20} className="upload-icon" />
                    <span>Choose a profile picture (JPG, PNG, WEBP)</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button
            type="primary"
            onClick={onClick}
            loading={loading}
            size="large"
            block
            className="auth-submit-btn"
          >
            <span>Create Account</span>
            <ArrowRight size={16} />
          </Button>

          <div className="auth-footer">
            <span>Already have an account?</span>{' '}
            <Link to="/login" className="reg-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
