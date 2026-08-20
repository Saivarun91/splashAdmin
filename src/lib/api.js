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
      const errMsg = errorData.error || errorData.message || `API Error: ${response.statusText}`;
      const err = new Error(errMsg);
      if (isTokenRelatedError({ message: errMsg })) {
        handleTokenError();
      }
      throw err;
    }

    // For 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (isTokenRelatedError(error)) {
      handleTokenError();
    }
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

function handleTokenError() {
  handleLogout();
}

function isTokenRelatedError(error) {
  if (!error?.message) return false;
  const msg = String(error.message).toLowerCase();
  return (
    msg.includes('token') ||
    msg.includes('401') ||
    msg.includes('unauthorized') ||
    msg.includes('authentication') ||
    msg.includes('expired') ||
    msg.includes('invalid credentials')
  );
}

async function uploadMultipart(endpoint, formData, method = 'POST') {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('auth_token') || localStorage.getItem('token'))
    : null;

  const response = await fetch(url, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (response.status === 401) {
    handleTokenError();
    throw new Error('Authentication failed. Please login again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status === false) {
    throw new Error(data.error || data.message || `API Error: ${response.statusText}`);
  }

  return data;
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
  getImages: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/organizations/${id}/images/?${queryString}`);
  },
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
    return uploadMultipart('/api/homepage/before-after/upload/', formData);
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

  getAllPublicGalleryImages: () => apiRequest('/api/homepage/public-gallery/all/'),

  getPublicGalleryOverview: () => apiRequest('/api/homepage/public-gallery/admin/overview/'),

  importPublicGalleryImages: (payload) => apiRequest('/api/homepage/public-gallery/import/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  uploadPublicGalleryImage: async (file, fields = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return uploadMultipart('/api/homepage/public-gallery/upload/', formData);
  },

  updatePublicGalleryImage: (imageId, data) => apiRequest(`/api/homepage/public-gallery/${imageId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deletePublicGalleryImage: (imageId) => apiRequest(`/api/homepage/public-gallery/${imageId}/delete/`, {
    method: 'DELETE',
  }),

  // Page content (CMS): home, about, vision_mission, tutorials, security
  getPageContent: (slug) => apiRequest(`/api/homepage/content/${slug}/`),
  getPageContentAdmin: (slug) => apiRequest(`/api/homepage/content/${slug}/admin/`),
  updatePageContent: (slug, content) => apiRequest(`/api/homepage/content/${slug}/admin/update/`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  }),

  // Blog (admin — /admin/blog/*)
  listBlogs: (page = 1, query = '') => {
    const params = new URLSearchParams({ page: String(page) });
    if (query && String(query).trim()) params.set('query', String(query).trim());
    return apiRequest(`/admin/blog/listing?${params.toString()}`);
  },
  getBlogDetails: (id) => apiRequest(`/admin/blog/details/${id}`),
  createBlog: (formData) => uploadMultipart('/admin/blog/add', formData, 'POST'),
  updateBlog: (id, formData) => uploadMultipart(`/admin/blog/update/${id}`, formData, 'POST'),
  deleteBlog: (id) => apiRequest(`/admin/blog/delete/${id}`, { method: 'DELETE' }),

  listLandingPages: (page = 1, query = '', filters = {}) => {
    const params = new URLSearchParams({ page: String(page) });
    if (query && String(query).trim()) params.set('query', String(query).trim());
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    return apiRequest(`/admin/landing-pages/listing?${params.toString()}`);
  },
  getLandingPage: (id) => apiRequest(`/admin/landing-pages/details/${id}`),
  createLandingPage: (data) => apiRequest('/admin/landing-pages/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateLandingPage: (id, data) => apiRequest(`/admin/landing-pages/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteLandingPage: (id) => apiRequest(`/admin/landing-pages/delete/${id}`, { method: 'DELETE' }),
  publishLandingPage: (id) => apiRequest(`/admin/landing-pages/publish/${id}`, { method: 'POST' }),
  unpublishLandingPage: (id) => apiRequest(`/admin/landing-pages/unpublish/${id}`, { method: 'POST' }),
  listGenerateCards: () => apiRequest('/admin/landing-pages/generate-cards'),
  createGenerateCard: (data) => apiRequest('/admin/landing-pages/generate-cards', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateGenerateCard: (id, data) => apiRequest(`/admin/landing-pages/generate-cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteGenerateCard: (id) => apiRequest(`/admin/landing-pages/generate-cards/${id}`, { method: 'DELETE' }),
  listEcommerceCards: () => apiRequest('/admin/landing-pages/ecommerce-cards'),
  createEcommerceCard: (data) => apiRequest('/admin/landing-pages/ecommerce-cards', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateEcommerceCard: (id, data) => apiRequest(`/admin/landing-pages/ecommerce-cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteEcommerceCard: (id) => apiRequest(`/admin/landing-pages/ecommerce-cards/${id}`, { method: 'DELETE' }),
  listAspectRatios: () => apiRequest('/admin/landing-pages/aspect-ratios'),
  downloadBlog: async (id) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const token =
      (typeof window !== 'undefined' &&
        (localStorage.getItem('auth_token') || localStorage.getItem('token'))) ||
      '';
    const res = await fetch(`${API_BASE}/admin/blog/download/${id}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let message = 'Download failed';
      try {
        const data = await res.json();
        message = data.message || message;
      } catch (_) {
        /* ignore */
      }
      throw new Error(message);
    }
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || `blog-${id}.pdf`;
    return { blob, filename };
  },

  // Admin: Get all support & contact form requests
  getAllSupportRequests: () => apiRequest('/api/homepage/support/all/'),

  // Admin: Upload content image (returns { url })
  uploadContentImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return uploadMultipart('/api/homepage/upload-image/', formData);
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

export const pricingAPI = {
  getAll: () => apiRequest('/api/plans/pricing/'),
  create: (data) => apiRequest('/api/plans/pricing/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/api/plans/pricing/${id}/update/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/api/plans/pricing/${id}/delete/`, {
    method: 'DELETE',
  }),
  updateTaxConfig: (data) => apiRequest('/api/plans/pricing/tax-config/', {
    method: 'PUT',
    body: JSON.stringify(data),
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
  getById: (id) => apiRequest(`/api/payments/admin/${id}/`),
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
      if (response.status === 401) {
        handleTokenError();
        throw new Error("Authentication failed. Please login again.");
      }
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

export const aiGenerationAPI = {
  getStatus: () => apiRequest('/api/credits/admin/ai-generation/'),
  setDisabled: (disabled) => apiRequest('/api/credits/admin/ai-generation/', {
    method: 'PUT',
    body: JSON.stringify({ disabled }),
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
 * Individual User API functions (admin - users without organization)
 */
export const individualUserAPI = {
  getAll: () => apiRequest('/api/admin/individual/list/'),
  getById: (id) => apiRequest(`/api/admin/individual/${id}/`),
  getImages: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/admin/individual/${id}/images/?${queryString}`);
  },
  addCredits: (id, amount, reason) => apiRequest(`/api/admin/individual/${id}/add-credits/`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason })
  }),
  removeCredits: (id, amount, reason) => apiRequest(`/api/admin/individual/${id}/remove-credits/`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason })
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

