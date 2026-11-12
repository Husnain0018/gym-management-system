/**
 * Centralized API Service with JWT authentication interceptor
 */

const API_BASE_URL = '/api';

/**
 * Get stored JWT token
 */
export function getToken() {
  return localStorage.getItem('fithub_token');
}

/**
 * Store JWT token
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem('fithub_token', token);
  } else {
    localStorage.removeItem('fithub_token');
  }
}

/**
 * Core fetch wrapper with error handling and Authorization header injection
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired or invalid, clear token
        setToken(null);
        window.dispatchEvent(new CustomEvent('fithub-unauthorized'));
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth API
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  changePassword: (passwords) => request('/auth/change-password', { method: 'POST', body: passwords }),

  // Dashboard API (Admin)
  getDashboardStats: () => request('/dashboard/stats', { method: 'GET' }),

  // Member Management API (Admin)
  getMembers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString();
    return request(`/members${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },
  getMemberById: (id) => request(`/members/${id}`, { method: 'GET' }),
  createMember: (formData) => request('/members', { method: 'POST', body: formData }),
  updateMember: (id, formData) => request(`/members/${id}`, { method: 'PUT', body: formData }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  resetMemberPassword: (id) => request(`/members/${id}/reset-password`, { method: 'POST' }),

  // Candidate/Member Own Profile API (IDOR Protected)
  getMemberOwnProfile: () => request('/member/profile', { method: 'GET' })
};
