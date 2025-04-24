import axios from "axios";
import React, { useEffect, useState } from "react";
import { getAuthToken } from "../../services/dashboardService";
const API_URL = import.meta.env.VITE_BACKEND_API;

const ExistingReminders = () => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const fetchExistingReminder = async () => {
      console.log("I am reaching here");
      const response = await axios.get(`${API_URL}/api/recurring/existing`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      setReminders(response?.data?.recurs)
    };
    fetchExistingReminder();
  }, []);

  return reminders ? (
    <div className=" m-3 border h-screen border-black">
      {reminders?.map((r) => (
        <div key={r._id}>
          <h4>{r.foodType}</h4>
          <p>
            {r.frequency} — Next:{" "}
            {new Date(r.nextScheduled).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <div className="w-96 h-[35rem] m-3  rounded-md shadow-lg p-4 flex items-center justify-center">
      <h5 className="text-gray-500 text-lg">No existing reminders</h5>
    </div>
  );
};

export default ExistingReminders;
