// api/admin.js - Central API module for admin functionality
import * as mockAPI from './mockData';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// Flag to control whether to use mock data or real API
const USE_MOCK_DATA = true;

// Helper function for making API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  // If using mock data, return early
  if (USE_MOCK_DATA) {
    console.log(`Mock API request: ${endpoint}`);
    return null; // This won't actually be used when mocking
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Get auth token from localStorage
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    },
    credentials: 'include'
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  
  return response.json();
};

// Analytics API calls
export const getOverviewStats = (timeframe) => {
  if (USE_MOCK_DATA) {
    return mockAPI.getOverviewStats(timeframe);
  }
  return apiRequest(`/stats/overview?timeframe=${timeframe}`);
};

export const getDonationStats = (timeframe) => {
  if (USE_MOCK_DATA) {
    return mockAPI.getDonationStats(timeframe);
  }
  return apiRequest(`/stats/donations?timeframe=${timeframe}`);
};

export const getUserStats = (timeframe) => {
  if (USE_MOCK_DATA) {
    return mockAPI.getUserStats(timeframe);
  }
  return apiRequest(`/stats/users?timeframe=${timeframe}`);
};

// User Management API calls
export const fetchUsers = (filters) => {
  if (USE_MOCK_DATA) {
    return mockAPI.fetchUsers(filters);
  }

  const queryParams = new URLSearchParams();
  if (filters.role !== 'all') queryParams.append('role', filters.role);
  if (filters.verificationStatus !== 'all') queryParams.append('verificationStatus', filters.verificationStatus);
  if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
  
  return apiRequest(`/users?${queryParams.toString()}`);
};

export const verifyUser = (userId, verified, notes = '') => {
  if (USE_MOCK_DATA) {
    return mockAPI.verifyUser(userId, verified, notes);
  }
  return apiRequest(`/users/${userId}/verify`, 'POST', {
    verified,
    notes
  });
};

export const flagUser = (userId, reason) => {
  if (USE_MOCK_DATA) {
    return mockAPI.flagUser(userId, reason);
  }
  return apiRequest(`/users/${userId}/flag`, 'POST', { reason });
};

export const deleteUser = (userId) => {
  if (USE_MOCK_DATA) {
    return mockAPI.deleteUser(userId);
  }
  return apiRequest(`/users/${userId}`, 'DELETE');
};

// Donation Tracking API calls
export const fetchDonations = (filters) => {
  if (USE_MOCK_DATA) {
    return mockAPI.fetchDonations(filters);
  }

  const queryParams = new URLSearchParams();
  if (filters.status !== 'all') queryParams.append('status', filters.status);
  if (filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
  if (filters.donorType !== 'all') queryParams.append('donorType', filters.donorType);
  if (filters.flagged) queryParams.append('flagged', true);
  
  return apiRequest(`/donations?${queryParams.toString()}`);
};

export const updateDonationStatus = (donationId, status) => {
  if (USE_MOCK_DATA) {
    return mockAPI.updateDonationStatus(donationId, status);
  }
  return apiRequest(`/donations/${donationId}/status`, 'PATCH', { status });
};

export const flagDonation = (donationId, reason) => {
    if (USE_MOCK_DATA) {
      return mockAPI.flagDonation(donationId, reason);
    }
    return apiRequest(`/donations/${donationId}/flag`, 'POST', { reason });
  };
  
  // Audit Logs API calls
  export const getAuditLogs = (filters) => {
    if (USE_MOCK_DATA) {
      return mockAPI.getAuditLogs(filters);
    }
  
    const queryParams = new URLSearchParams();
    if (filters.severity !== 'all') queryParams.append('severity', filters.severity);
    if (filters.action !== 'all') queryParams.append('action', filters.action);
    if (filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
    if (filters.userId) queryParams.append('userId', filters.userId);
    
    return apiRequest(`/logs?${queryParams.toString()}`);
  };
  
  // Distribution management API calls
  export const fetchDistributions = (filters = {}) => {
    if (USE_MOCK_DATA) {
      // Get the distributions from mock data
      const distributions = mockAPI.mockData.distributions;
      
      // Apply basic filtering
      let filteredDistributions = [...distributions];
      
      if (filters.status) {
        filteredDistributions = filteredDistributions.filter(dist => dist.status === filters.status);
      }
      
      if (filters.dateRange) {
        const now = new Date();
        let cutoffDate;
        
        switch (filters.dateRange) {
          case 'today':
            cutoffDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            cutoffDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            cutoffDate = new Date(0);
        }
        
        filteredDistributions = filteredDistributions.filter(dist => 
          new Date(dist.date) >= cutoffDate
        );
      }
      
      // Return the filtered distributions with a delay to simulate API request
      return new Promise(resolve => {
        setTimeout(() => resolve(filteredDistributions), 500);
      });
    }
    
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
    if (filters.distributorId) queryParams.append('distributorId', filters.distributorId);
    
    return apiRequest(`/distributions?${queryParams.toString()}`);
  };
  
  export const updateDistributionStatus = (distributionId, status, data = {}) => {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => resolve({ 
          success: true, 
          distributionId, 
          status, 
          message: `Distribution ${distributionId} status updated to ${status}` 
        }), 300);
      });
    }
    
    return apiRequest(`/distributions/${distributionId}/status`, 'PATCH', { status, ...data });
  };
  
  export const assignDonationToDistribution = (distributionId, donationIds) => {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => resolve({ 
          success: true, 
          distributionId,
          donationIds,
          message: `${donationIds.length} donations assigned to distribution ${distributionId}` 
        }), 400);
      });
    }
    
    return apiRequest(`/distributions/${distributionId}/donations`, 'POST', { donationIds });
  };
  
  export const assignVolunteersToDistribution = (distributionId, volunteerIds) => {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => resolve({ 
          success: true, 
          distributionId,
          volunteerIds,
          message: `${volunteerIds.length} volunteers assigned to distribution ${distributionId}` 
        }), 350);
      });
    }
    
    return apiRequest(`/distributions/${distributionId}/volunteers`, 'POST', { volunteerIds });
  };
  
  // Export direct access to mock data for development/testing
  export const getMockData = () => {
    if (USE_MOCK_DATA) {
      return mockAPI.mockData;
    }
    return null;
  };
  
  // Toggle mock data usage (useful for development switching)
  export const setUseMockData = (useMock) => {
    // This doesn't actually modify the constant, but can be used for logging
    console.log(`API mode set to: ${useMock ? 'MOCK' : 'REAL'}`);
    // In a real implementation, you might use a state management system to track this
  };