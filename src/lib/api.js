/**
 * API utility functions for connecting to the backend
 * Backend endpoints are based on splash_backend structure
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Global variables to track refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Generic API fetch function with auto-refresh mechanism
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Clone headers to avoid mutation issues
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authentication token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      // Prevent infinite loops if the refresh endpoint itself returns 401
      if (endpoint === '/api/token/refresh/') {
        throw new Error('Refresh token expired');
      }

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          // No refresh token, force logout
          handleLogout();
          throw new Error('Authentication failed. No refresh token.');
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            config.headers.Authorization = `Bearer ${token}`;
            return fetch(url, config).then(res => res.json());
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        isRefreshing = true;

        try {
          // Verify with backend refresh endpoint
          const refreshResponse = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Refresh failed');
          }

          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.access;

          localStorage.setItem('auth_token', newAccessToken);
          // If backend rotates refresh token
          if (refreshData.refresh) {
            localStorage.setItem('refresh_token', refreshData.refresh);
          }

          isRefreshing = false;
          processQueue(null, newAccessToken);

          // Retry original request
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          const retryResponse = await fetch(url, config);
          return await retryResponse.json();

        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          handleLogout();
          throw new Error('Session expired. Please login again.');
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.statusText}`);
    }

    // For 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  }
}

/**
 * Authentication API functions
 */
export const authAPI = {
  login: async (email, password) => {
    const tokenData = await apiRequest('/api/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (tokenData && tokenData.access) {
      // Manually call getProfile with the new token
      // We can't use authAPI.getProfile() easily here because it relies on apiRequest which relies on localStorage
      // So we manually pass the header to apiRequest for the profile call
      const userProfile = await apiRequest('/api/profile/', {
        headers: { Authorization: `Bearer ${tokenData.access}` }
      });

      return {
        token: tokenData.access,
        refresh: tokenData.refresh,
        user: userProfile
      };
    }
    return tokenData;
  },
  refreshToken: (refresh) => apiRequest('/api/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh })
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
 * API Service wrapper for compatibility with AuthContext
 * Wraps authAPI to match the expected apiService interface
 */
export const apiService = {
  login: authAPI.login,
  register: authAPI.register,
  getProfile: authAPI.getProfile,
  updateProfile: authAPI.updateProfile,
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
 * Legal Compliance API functions
 * Based on LegalCompliance model from splash_backend/legal/models.py
 */
export const legalAPI = {
  getAll: () => apiRequest('/api/legal/'),
  update: (contentType, data) => apiRequest(`/api/legal/${contentType}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
};

/**
 * Homepage API functions
 * For managing homepage content (Before/After images)
 */
export const homepageAPI = {
  // Public: Get all active before/after images
  getBeforeAfterImages: () => apiRequest('/api/homepage/before-after/'),

  // Admin: Get all before/after images (including inactive)
  getAllBeforeAfterImages: () => apiRequest('/api/homepage/before-after/all/'),

  // Admin: Upload before/after images
  uploadBeforeAfterImages: async (beforeFile, afterFile) => {
    const formData = new FormData();
    formData.append('before_image', beforeFile);
    formData.append('after_image', afterFile);

    const url = `${API_BASE_URL}/api/homepage/before-after/upload/`;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;

    const config = {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.statusText}`);
    }
    return await response.json();
  },

  // Admin: Update before/after image
  updateBeforeAfterImage: (imageId, data) => apiRequest(`/api/homepage/before-after/${imageId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Admin: Delete before/after image
  deleteBeforeAfterImage: (imageId) => apiRequest(`/api/homepage/before-after/${imageId}/delete/`, {
    method: 'DELETE'
  }),

  // Page content (CMS): home, about, vision_mission, tutorials, security
  getPageContent: (slug) => apiRequest(`/api/homepage/content/${slug}/`),
  getPageContentAdmin: (slug) => apiRequest(`/api/homepage/content/${slug}/admin/`),
  updatePageContent: (slug, content) => apiRequest(`/api/homepage/content/${slug}/admin/update/`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  }),

  // Blog (public - for reference; admin uses below)
  getBlogPosts: () => apiRequest('/api/homepage/blog/'),
  getBlogPost: (slug) => apiRequest(`/api/homepage/blog/${slug}/`),
  // Blog (admin)
  getAllBlogPosts: () => apiRequest('/api/homepage/blog/admin/all/'),
  createBlogPost: (data) => apiRequest('/api/homepage/blog/admin/create/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateBlogPost: (slug, data) => apiRequest(`/api/homepage/blog/admin/${slug}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteBlogPost: (slug) => apiRequest(`/api/homepage/blog/admin/${slug}/delete/`, {
    method: 'DELETE'
  }),

  // Admin: Upload content image (returns { url })
  uploadContentImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const url = `${API_BASE_URL}/api/homepage/upload-image/`;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    return response.json();
  },
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



// Prompt Master endpoints
export const promptMasterAPI = {
  getPrompts: (token) => apiRequest('/probackendapp/api/prompts/', {
    headers: {
      'Authorization': `Bearer ${token || ''}`,
    },
  }),
  getPrompt: (promptId, token) => apiRequest(`/probackendapp/api/prompts/${promptId}/`, {
    headers: {
      'Authorization': `Bearer ${token || ''}`,
    },
  }),
  createPrompt: (promptData, token) => apiRequest('/probackendapp/api/prompts/create/', {
    method: 'POST',
    body: JSON.stringify(promptData),
    headers: {
      'Authorization': `Bearer ${token || ''}`,
    },
  }),
  updatePrompt: (promptId, promptData, token) => apiRequest(`/probackendapp/api/prompts/${promptId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(promptData),
    headers: {
      'Authorization': `Bearer ${token || ''}`,
    },
  }),
  deletePrompt: (promptId, token) => apiRequest(`/probackendapp/api/prompts/${promptId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token || ''}`,
    },
  }),
  initializePrompts: (token) => apiRequest('/probackendapp/api/prompts/initialize/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || ''}`,
    },
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
  getSalesLeads: () => apiRequest('/api/payments/admin/leads/'),
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

