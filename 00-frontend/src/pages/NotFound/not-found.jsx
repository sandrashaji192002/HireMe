import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-light)',
          marginBottom: 20,
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.25)',
        }}
      >
        <Compass size={36} />
      </div>

      <h1
        style={{
          fontSize: '72px',
          fontWeight: 800,
          margin: 0,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          letterSpacing: '-0.04em',
        }}
      >
        404
      </h1>

      <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '14px 0 8px', color: '#ffffff' }}>
        Page Not Found
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '420px',
          margin: '0 0 24px',
          fontSize: '15px',
        }}
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link to="/dashboard">
        <Button type="primary" size="large" icon={<ArrowLeft size={16} />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
