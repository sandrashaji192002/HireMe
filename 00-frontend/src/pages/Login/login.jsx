import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/auth-context';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onClick = async () => {
    if (!form.email || !form.password) {
      message.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        message.success('Welcome back!');
        navigate('/dashboard');
      } else {
        message.error(data.message || 'Login failed');
      }
    } catch (e) {
      message.error('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      onClick();
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="auth-brand-badge">
          <div className="auth-brand-icon">
            <Sparkles size={22} />
          </div>
          <span className="auth-brand-name">
            Hire<span className="brand-highlight">Me</span>
          </span>
        </div>

        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue to your dashboard</p>
        </div>

        <div className="login-form" onKeyDown={handleKeyDown}>
          <div className="input-item">
            <label>Email Address</label>
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
            <label>Password</label>
            <Input.Password
              name="password"
              prefix={<Lock size={16} className="input-icon" />}
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              size="large"
            />
          </div>

          <Button
            type="primary"
            onClick={onClick}
            loading={loading}
            size="large"
            block
            className="auth-submit-btn"
          >
            <span>Sign In</span>
            <ArrowRight size={16} />
          </Button>

          <div className="auth-footer">
            <span>Don't have an account?</span>{' '}
            <Link to="/register" className="reg-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
