export const API_URL = 'http://localhost:3000';

export const fileUrl = path => (path ? `${API_URL}${path}` : null);

export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
};
