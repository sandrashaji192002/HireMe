import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { Sparkles, Send } from 'lucide-react';
import { authFetch } from '../../utils/api';

const ApplyModal = ({ open, jobId, jobTitle, onClose, onApplied }) => {
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await authFetch(`/api/applications/apply/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverNote }),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('Application submitted successfully!');
      } else {
        message.error(data.message);
      }

      if (response.ok || response.status === 409) {
        setCoverNote('');
        onApplied();
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setSubmitting(false);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--primary-gradient)',
              color: '#ffffff',
            }}
          >
            <Sparkles size={16} />
          </div>
          <span>Apply for {jobTitle}</span>
        </div>
      }
      open={open}
      onOk={onSubmit}
      onCancel={onClose}
      okText={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>Submit Application</span>
          <Send size={14} />
        </span>
      }
      confirmLoading={submitting}
      destroyOnClose
    >
      <div style={{ margin: '14px 0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13.5 }}>
          Your profile, education, experience, and uploaded resume will be shared directly with the hiring recruiter.
        </p>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 6,
            }}
          >
            Cover Note (Optional):
          </label>
          <Input.TextArea
            rows={5}
            maxLength={1000}
            showCount
            value={coverNote}
            onChange={e => setCoverNote(e.target.value)}
            placeholder="Tell the hiring manager why your background is a great match for this position..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default ApplyModal;
