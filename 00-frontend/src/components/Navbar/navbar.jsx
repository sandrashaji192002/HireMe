import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Avatar, Tooltip } from 'antd';
import {
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  UserCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { fileUrl } from '../../utils/api';
import ChangePhotoModal from '../ChangePhotoModal/change-photo-modal';
import './navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [photoOpen, setPhotoOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <div className="nav-left">
        <Link to="/dashboard" className="brand">
          <span className="brand-icon-wrapper">
            <Sparkles size={18} className="brand-sparkle" />
          </span>
          <span className="brand-text">
            Hire<span className="brand-highlight">Me</span>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/dashboard" className="nav-link">
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>

          {user?.role === 'student' && (
            <>
              <NavLink to="/jobs" className="nav-link">
                <Briefcase size={16} />
                <span>Jobs</span>
              </NavLink>
              <NavLink to="/profile" className="nav-link">
                <UserCircle size={16} />
                <span>Profile</span>
              </NavLink>
            </>
          )}

          {user?.role === 'recruiter' && (
            <NavLink to="/post-job" className="nav-link">
              <PlusCircle size={16} />
              <span>Post Job</span>
            </NavLink>
          )}
        </nav>
      </div>

      <div className="nav-right">
        <div
          className="user-profile-badge"
          onClick={() => setPhotoOpen(true)}
          title="Click to change photo"
        >
          <Avatar
            className="nav-avatar"
            src={fileUrl(user?.profileImageUrl)}
            icon={<User size={16} />}
          />
          <div className="user-info-text">
            <span className="user-name">{user?.name}</span>
            <span className="user-role-badge">
              {user?.role === 'recruiter' ? 'Recruiter' : 'Student'}
            </span>
          </div>
        </div>

        <Tooltip title="Log out">
          <button className="logout-btn" onClick={onLogout} aria-label="Log out">
            <LogOut size={18} />
          </button>
        </Tooltip>
      </div>

      <ChangePhotoModal open={photoOpen} onClose={() => setPhotoOpen(false)} />
    </header>
  );
};

export default Navbar;
