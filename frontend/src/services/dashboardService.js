// frontend/src/services/dashboardService.js
import axios from 'axios';

export const getDashboardStats = async () => {
  const res = await axios.get('http://localhost:5000/api/admin/dashboard-stats');
  return res.data;
};

export const getDashboardAlerts = async () => {
  const res = await axios.get('http://localhost:5000/api/admin/dashboard-alerts');
  return res.data.alerts;
};
export const getRecentDonations = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/recent-donations'); // adjust route as needed
    return res.data.recentDonations;
  };
export const getUpcomingDistributions = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/upcoming-distributions');
    return res.data.upcomingDistributions;
  };