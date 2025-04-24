// components/EditReminderModal.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import axios from "axios";
import { getAuthToken } from "../../services/dashboardService";

const API_URL = import.meta.env.VITE_BACKEND_API;

const EditReminderModal = ({ reminder, onClose, onUpdated }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      foodType: reminder.foodType,
      storage: reminder.storage,
      frequency: reminder.frequency,
      startDate: new Date(reminder.startDate).toISOString().split("T")[0],
      weight: reminder.weight,
    },
  });

  const onSubmit = async (data) => {
    try {
      await axios.put(`${API_URL}/api/recurring/${reminder._id}`, data, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      onUpdated(); // Refresh reminders list
      onClose();   // Close modal
    } catch (err) {
      console.error("Failed to update reminder:", err);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white p-6 rounded-xl w-full max-w-lg"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Reminder</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input {...register("foodType")} placeholder="Food Type" className="w-full border p-2 rounded" />
          <input {...register("weight")} placeholder="Weight (e.g. 2kg)" className="w-full border p-2 rounded" />

          <select {...register("storage")} className="w-full border p-2 rounded">
            <option value="room temp">Room Temp</option>
            <option value="refrigerated">Refrigerated</option>
            <option value="frozen">Frozen</option>
          </select>

          <select {...register("frequency")} className="w-full border p-2 rounded">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <input type="date" {...register("startDate")} className="w-full border p-2 rounded" />

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditReminderModal;
