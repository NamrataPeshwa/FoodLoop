import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API;

export const getAuthToken = () => {
  const token = localStorage.getItem("token");  // Check if this is available

if (!token) {
  console.error("No token found in localStorage.");
  return;
}
  return localStorage.getItem("token"); 
   // Retrieve the token from localStorage
};

export const getDashboardStats = async () => {
  const res = await axios.get(`${API_URL}/api/admin/dashboard-stats`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`  // Include the token in the Authorization header
    }
  });
  return res.data;
};

export const getDashboardAlerts = async () => {
  const res = await axios.get(`${API_URL}/api/admin/dashboard-alerts`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
  return res.data.alerts;
};

export const getRecentDonations = async () => {
  const res = await axios.get(`${API_URL}/api/admin/recent-donations`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
  return res.data.recentDonations;
};

export const getUpcomingDistributions = async () => {
  const res = await axios.get(`${API_URL}/api/admin/upcoming-distributions`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
  return res.data.upcomingDistributions;
};

export const createFoodRequest = async (requestData) => {
  try {
    const res = await axios.post(`${API_URL}/api/request`, requestData, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error creating food request:", error);
    throw error;
  }
};
