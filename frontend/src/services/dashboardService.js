// frontend/src/services/dashboardService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API;

export const getDashboardStats = async () => {
  const res = await axios.get(`${API_URL}/api/admin/dashboard-stats`);
  return res.data;
};

export const getDashboardAlerts = async () => {
  const res = await axios.get(`${API_URL}/api/admin/dashboard-alerts`);
  return res.data.alerts;
};

export const getRecentDonations = async () => {
  const res = await axios.get(`${API_URL}/api/admin/recent-donations`); // adjust route as needed
  return res.data.recentDonations;
};

export const getUpcomingDistributions = async () => {
  const res = await axios.get(`${API_URL}/api/admin/upcoming-distributions`);
  return res.data.upcomingDistributions;
};