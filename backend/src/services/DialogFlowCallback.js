const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
dotenv.config()

const BACKEND_URL ="https://foodloop-72do.onrender.com/api";

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const action = req.body.queryResult?.action || req.body.queryResult?.intent?.displayName;
  const params = req.body.queryResult?.parameters || {};
  const authHeader = req.headers.authorization;
  let responseText = "I'm not sure how to help with that yet.";

  try {
    // Get Donation Status
    if (["get_donation_status", "GetDonationStatus"].includes(action)) {
      const donationId = params.donation_id;
      const response = await axios.get(`${BACKEND_URL}/transaction/status/${donationId}`, {
        headers: { Authorization: authHeader },
      });
      const status = response.data.status || "unknown";
      responseText = `The current status of donation ${donationId} is: ${status}.`;
    }

    // List Available Food
    else if (["list_available_food", "ListAvailableFood"].includes(action)) {
      const response = await axios.get(`${BACKEND_URL}/foodlistings/available`, {
        headers: { Authorization: authHeader },
      });
      const items = response.data;

      if (!items.length) {
        responseText = "No food items are currently available for donation.";
      } else {
        const topItems = items.slice(0, 3).map(item =>
          `🍱 ${item.foodType} (expires: ${item.expirationDate.split("T")[0]})`
        ).join("\n");
        responseText = `Here are some available food items:\n${topItems}`;
      }
    }

    // Create Donation
    else if (action === "create_donation") {
      const itemsList = (params.items || []).map(entry => {
        const [name, quantity] = entry.split(":");
        return { name: name.trim(), quantity: parseInt(quantity.trim()) };
      });

      const payload = {
        fullAddress: params.fullAddress,
        foodDescription: params.foodDescription,
        foodType: params.foodType,
        predictedCategory: params.predictedCategory,
        hoursOld: params.hoursOld,
        storage: params.storage,
        weight: params.weight,
        isPerishable: params.isPerishable || false,
        expirationDate: params.expirationDate,
        items: itemsList,
        value: params.value || 0,
      };

      const response = await axios.post(`${BACKEND_URL}/donations/create`, payload, {
        headers: { Authorization: authHeader },
      });

      if (response.status === 201) {
        responseText = `Your donation has been created successfully! Donation ID: ${response.data._id}.`;
      } else {
        responseText = "Sorry, I couldn't create your donation. Please try again later.";
      }
    }

  } catch (err) {
    console.error("Webhook error:", err.response?.data || err.message);
    responseText = "Something went wrong while processing your request.";
  }

  return res.json({ fulfillmentText: responseText });
});