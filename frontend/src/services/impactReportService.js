

import axios from 'axios';

export const getImpactStats = async () => {
  const response = await axios.get('/api/impact/stats');
  return response.data;
};

export const getDonationTrends = async () => {
  const response = await axios.get('/api/impact/donation-trends');
  return response.data.donationStats;
};
// Fetch monthly donation trends
export const getDonationGrowth = async () => {
    const res = await axios.get('/api/impact/donation-growth');
    return res.data.donationStats; // Assuming 'donationStats' is the response data
  };
  
  // Fetch user trust percentage (active donors)
  export const getUserTrust = async () => {
    const res = await axios.get('/api/impact/user-trust');
    return res.data.trustPercentage; // Assuming 'trustPercentage' is the response data
  };