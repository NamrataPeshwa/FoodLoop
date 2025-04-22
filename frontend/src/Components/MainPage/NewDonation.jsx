import React, { useState } from "react";
import { X } from "lucide-react";
import { FoodDistributionSidebar } from "./Sidebar";

const getAddressFromCoords = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await res.json();
    return {
      landmark: data?.address?.attraction || data?.address?.building || "",
      area:
        data?.address?.suburb ||
        data?.address?.neighbourhood ||
        data?.address?.city_district ||
        "",
      address: data?.display_name || "",
    };
  } catch (err) {
    console.error("Error fetching location:", err);
    return { landmark: "", area: "", address: "" };
  }
};

const DonationForm = () => {
  const [donorType, setDonorType] = useState("common");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    landmark: "",
    area: "",
    address: "",
    expiryTime: "",
    photo: null,
  });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const removeImage = () => {
    setPreview(null);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = await getAddressFromCoords(latitude, longitude);
        setFormData((prev) => ({
          ...prev,
          landmark: locationData.landmark,
          area: locationData.area,
          address: locationData.address,
        }));
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      if (file && file.size > 1024 * 1024) {
        alert("Photo must be less than or equal to 1MB");
        return;
      } else {
        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
      }
      setFormData({ ...formData, photo: file });
    } else if (name === "quantity") {
      const isValidNumber = /^\d+(\.\d+)?$/.test(value);
      if (!isValidNumber && value !== "") return;
      setFormData({ ...formData, quantity: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (formData.title.length > 50) {
      alert("Title should not exceed 50 characters.");
      setIsSubmitting(false);
      return;
    }

    if (formData.description.length > 200) {
      alert("Description should not exceed 200 characters.");
      setIsSubmitting(false);
      return;
    }

    if (formData.photo && formData.photo.size > 1024 * 1024) {
      alert("Photo must be less than or equal to 1MB");
      setIsSubmitting(false);
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(formData.quantity)) {
      alert("Quantity must be a valid number in kg.");
      setIsSubmitting(false);
      return;
    }

    const submissionData = new FormData();
    submissionData.append("donorType", donorType);
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submissionData.append(key, value);
    });

    try {
      const response = await fetch(
        "https://your-api-endpoint.com/food-donation", // URL to be added
        {
          method: "POST",
          body: submissionData,
        }
      );

      if (!response.ok) throw new Error("Failed to submit");

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setFormData({
        title: "",
        description: "",
        quantity: "",
        landmark: "",
        area: "",
        address: "",
        expiryTime: "",
        photo: null,
      });
      setPreview(null);
    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <div className="flex h-screen bg-gray-100">
    <div className="flex w-full flex-1 flex-col overflow-hidden border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800">
      {/* Sidebar component */}
      <FoodDistributionSidebar />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div
          className="relative w-full h-auto bg-cover bg-center flex items-center p-10 justify-center"
          style={{
            backgroundImage: `url('/community-meal-3.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>
          <div className="z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-Birthstone font-bold text-white drop-shadow-[0_0_10px_gray-50] mb-6 animate-pulse">
              Every meal you share brings a smile
            </h1>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-300 to-transparent z-10"></div>
        </div>

        <div className="bg-gray-300 w-full p-8">
          <div className="max-w-5xl rounded-2xl font-merriweather m-auto shadow-xl shadow-gray-500 p-6 bg-gray-200">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">New Donation</h2>
              <div className="flex gap-4 items-center">
                <label htmlFor="donorType" className="font-medium">
                  Donor Type:
                </label>
                <select
                  id="donorType"
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white text-colour1 focus:outline-none focus:ring-2 focus:ring-amber-600"
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="common">Common User</option>
                  <option value="hotel">Hotel/Café</option>
                </select>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block font-semibold">Food Type</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                  maxLength={50}
                  placeholder=""
                />
              </div>

              <div>
                <label className="block font-semibold">
                  Quantity (kg or servings)
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                  inputMode="decimal"
                  placeholder="kg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                  maxLength={200}
                  placeholder="Good Condition"
                ></textarea>
              </div>

              {donorType === "common" && (
                <>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="mb-2 bg-amber-500 text-white px-4 py-1 rounded hover:bg-amber-700 transition-all"
                    >
                      Use Current Location
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold">Full Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="Full Address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Near Central Park Gate"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold">Area</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Andheri West"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold">Expiry Time</label>
                <input
                  type="datetime-local"
                  name="expiryTime"
                  value={formData.expiryTime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-center w-full">
                  <div
                    className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      preview
                        ? "bg-cover bg-center bg-no-repeat"
                        : "bg-amber-300 hover:bg-amber-400 "
                    } border-gray-300 dark:border-gray-600`}
                    style={preview ? { backgroundImage: `url(${preview})` } : {}}
                  >
                    {!preview && (
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-full"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-black "
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-black ">
                            <span className="font-semibold">Click to upload</span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-black ">
                            SVG, PNG, JPG or GIF (MAX. 800x400px)
                          </p>
                        </div>
                        <input
                          id="dropzone-file"
                          name="photo"
                          type="file"
                          className="hidden"
                          onChange={handleChange}
                          accept="image/*"
                        />
                      </label>
                    )}

                    {preview && (
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 ">
                <button
                  type="submit"
                  className="bg-colour1 w-full text-white text-xl px-6 py-2 rounded hover:bg-amber-500 transition-all"
                >
                  Confirm Donation
                </button>
                {isSubmitting && (
                  <div className="mt-4 text-blue-600 font-semibold animate-pulse">
                    ⏳ Submitting your donation...
                  </div>
                )}

                {showSuccess && (
                  <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold animate-bounce shadow-md">
                    🎉 Thank you! Your donation has been listed successfully.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default DonationForm;
