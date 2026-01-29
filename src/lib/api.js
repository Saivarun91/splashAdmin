/**
 * API utility functions for connecting to the backend
 * Backend endpoints are based on splash_backend structure
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic API fetch function
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token if available
  // Backend uses JWT Bearer token authentication
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Authentication API functions
 */
export const authAPI = {
  login: (email, password) => apiRequest('/api/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (data) => apiRequest('/api/register/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getProfile: () => apiRequest('/api/profile/'),
  updateProfile: (data) => apiRequest('/api/profile/update/', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
};

/**
 * Dashboard API functions
 * Admin dashboard statistics
 */
export const dashboardAPI = {
  getStats: () => apiRequest('/api/admin/dashboard/stats'),
  getImageGenerationData: (timeRange = 'day', startDate = null, endDate = null) => {
    let url = `/api/admin/dashboard/images?range=${timeRange}`;
    if (startDate && endDate) {
      url += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
    }
    return apiRequest(url);
  },
  getAllCharts: () => apiRequest('/api/admin/dashboard/all-charts'),
};

/**
 * Organization API functions
 * Based on Organization model from splash_backend/organization/models.py
 */
export const organizationAPI = {
  getAll: () => apiRequest('/api/organizations/list/'),
  getById: (id) => apiRequest(`/api/organizations/${id}/`),
  create: (data) => apiRequest('/api/organizations/create/', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id, data) =>
    apiRequest(`/api/organizations/${id}/update/`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  delete: (id) => apiRequest(`/api/organizations/${id}/delete/`, { 
    method: 'DELETE' 
  }),
  addCredits: (id, amount, reason) => apiRequest(`/api/organizations/${id}/add-credits/`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason })
  }),
  removeCredits: (id, amount, reason) => apiRequest(`/api/organizations/${id}/remove-credits/`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason })
  }),
  getCredits: (id) => apiRequest(`/api/organizations/${id}/`),
  addUser: (data) => apiRequest('/api/organizations/add-user/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  removeUser: (organizationId, userId) => apiRequest(`/api/organizations/${organizationId}/users/${userId}/remove/`, {
    method: 'DELETE'
  }),
};

/**
 * Subscription/Plan API functions
 * Based on Plan model from splash_backend/plans/models.py
 * Note: Plan management endpoints may need to be created in backend
 */
export const subscriptionAPI = {
  getAll: () => apiRequest('/api/plans/'),
  getById: (id) => apiRequest(`/api/plans/${id}/`),
  create: (data) => apiRequest('/api/plans/create/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) =>
    apiRequest(`/api/plans/${id}/update/`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  delete: (id) => apiRequest(`/api/plans/${id}/delete/`, {
    method: 'DELETE'
  }),
};

/**
 * Payment API functions
 * Note: Payment endpoints may need to be created in the backend
 */
export const paymentAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/payments/admin/all/?${queryString}`);
  },
  getById: (id) => apiRequest(`/probackendapp/api/admin/payments/${id}`),
  getRevenue: () => apiRequest('/api/payments/admin/revenue/'),
  getHistory: (organizationId) => apiRequest(`/api/payments/history/?organization_id=${organizationId}`),
};

/**
 * Invoice API functions
 */
export const invoiceAPI = {
  getInvoice: (transactionId) =>
    apiRequest(`/api/invoices/${transactionId}/`),
  getConfig: () =>
    apiRequest(`/api/invoices/config/`),
  updateConfig: (config) => apiRequest('/api/invoices/config/', {
    method: 'PUT',
    body: JSON.stringify(config),
  }),
  downloadInvoice: (transactionId) => {
    const url = `${API_BASE_URL}/api/invoices/${transactionId}/download/`;
    const token = typeof window !== "undefined" ? (localStorage.getItem("auth_token") || localStorage.getItem("token")) : null;
    
    return fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }).then((response) => {
      if (!response.ok) throw new Error("Failed to download invoice");
      return response.blob();
    });
  },
  getTemplate: () => apiRequest('/api/invoices/template/'),
  updateTemplate: (template) => apiRequest('/api/invoices/template/', {
    method: 'PUT',
    body: JSON.stringify({ template }),
  }),
};

/**
 * Mail Templates API (admin only)
 */
export const mailTemplatesAPI = {
  getAll: () => apiRequest('/api/mail-templates/'),
  getBySlug: (slug) => apiRequest(`/api/mail-templates/${slug}/`),
  update: (slug, data) => apiRequest(`/api/mail-templates/${slug}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

/**
 * Credits Usage API functions
 * Based on CreditLedger model from splash_backend/CREDITS/models.py
 */
export const creditsAPI = {
  getAllOrganizationsUsage: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/credits/all-organizations/usage/?${queryString}`);
  },
  getOrganizationUsage: (orgId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/credits/organization/${orgId}/usage/?${queryString}`);
  },
  getOrganizationSummary: (orgId) => 
    apiRequest(`/api/credits/organization/${orgId}/summary/`),
  getUsageStatistics: (timeRange = 'month', periodCount = 6) => {
    return apiRequest(`/api/credits/admin/usage-statistics/?time_range=${timeRange}&period_count=${periodCount}`);
  },
  getSettings: () => apiRequest('/api/credits/admin/settings/'),
  updateSettings: (data) => apiRequest('/api/credits/admin/settings/update/', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
};

/**
 * Image Generation History API functions
 * Based on recent history endpoints from splash_backend/probackendapp/urls.py
 */
export const imageHistoryAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/probackendapp/api/recent/images?${queryString}`);
  },
  getById: (id) => apiRequest(`/probackendapp/api/recent/images/${id}`),
  getHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/probackendapp/api/recent/history?${queryString}`);
  },
  getProjectHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/probackendapp/api/recent/project-history?${queryString}`);
  },
};

/**
 * Prompt Master API functions
 * Based on prompt endpoints from splash_backend/probackendapp/urls.py
 */
export const promptAPI = {
  getAll: () => apiRequest('/probackendapp/api/prompts/'),
  getById: (id) => apiRequest(`/probackendapp/api/prompts/${id}/`),
  create: (data) => apiRequest('/probackendapp/api/prompts/create/', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id, data) =>
    apiRequest(`/probackendapp/api/prompts/${id}/update/`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  delete: (id) => apiRequest(`/probackendapp/api/prompts/${id}/`, { 
    method: 'DELETE' 
  }),
  initialize: () => apiRequest('/probackendapp/api/prompts/initialize/', { 
    method: 'POST' 
  }),
};

/**
 * Projects API functions
 * Based on Project endpoints from splash_backend/probackendapp/urls.py
 */
export const projectAPI = {
  getAll: () => apiRequest('/probackendapp/api/projects/'),
  getById: (id) => apiRequest(`/probackendapp/api/projects/${id}/`),
  create: (data) => apiRequest('/probackendapp/api/projects/create/', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id, data) => apiRequest(`/probackendapp/api/projects/${id}/update/`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id) => apiRequest(`/probackendapp/api/projects/${id}/delete/`, { 
    method: 'DELETE' 
  }),
};

/**
 * Users API functions
 * Based on User model from splash_backend/users/models.py
 */
export const userAPI = {
  getAll: () => apiRequest('/api/users/'),
  getById: (id) => apiRequest(`/api/users/${id}/`),
  invite: (data) => apiRequest('/api/users/invite/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};

export default apiRequest;

