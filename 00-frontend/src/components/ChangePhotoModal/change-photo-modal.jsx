import { useState, useEffect } from 'react';
import { Modal, Avatar, message } from 'antd';
import { User, Camera, UploadCloud } from 'lucide-react';
import { authFetch, fileUrl } from '../../utils/api';
import { useAuth } from '../../context/auth-context';

const ChangePhotoModal = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFileChange = e => {
    const picked = e.target.files[0];
    if (!picked) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(picked.type)) {
      message.error('Only JPG, PNG or WEBP images are allowed');
      e.target.value = '';
      return;
    }
    if (picked.size > 2 * 1024 * 1024) {
      message.error('Image must be smaller than 2 MB');
      e.target.value = '';
      return;
    }
    setFile(picked);
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const onSubmit = async () => {
    if (!file) {
      message.error('Please choose an image first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await authFetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        updateUser({ ...user, profileImageUrl: data.profileImageUrl });
        message.success('Profile photo updated successfully');
        handleClose();
      } else {
        message.error(data.message);
      }
    } catch (e) {
      message.error('Cannot connect to server');
    }
    setUploading(false);
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
            <Camera size={16} />
          </div>
          <span>Update Profile Photo</span>
        </div>
      }
      open={open}
      onOk={onSubmit}
      onCancel={handleClose}
      okText="Save New Photo"
      confirmLoading={uploading}
      destroyOnClose
    >
      {open && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '20px 0 12px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Avatar
              size={110}
              src={preview || fileUrl(user?.profileImageUrl)}
              icon={<User size={48} />}
              style={{
                border: '3px solid var(--primary)',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
              }}
            />
          </div>

          <label
            htmlFor="photo-upload-input"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              background: 'rgba(30, 23, 56, 0.8)',
              border: '1px dashed var(--border-strong)',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <UploadCloud size={16} color="var(--primary-light)" />
            <span>{file ? file.name : 'Select Image File'}</span>
          </label>

          <input
            id="photo-upload-input"
            type="file"
            style={{ display: 'none' }}
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
          />

          <small style={{ color: 'var(--text-dim)', fontSize: 12 }}>
            Supports JPG, PNG or WEBP · Maximum size 2 MB
          </small>
        </div>
      )}
    </Modal>
  );
};

export default ChangePhotoModal;
