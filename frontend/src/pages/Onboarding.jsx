import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/ui/Loader";
import InfoSidebar from "../Components/ui/InfoSidebar.jsx";
import { FoodMeteors } from "../Components/ui/FoodMeteors";
import MapPicker from "../Components/ui/MapPicker"; // Assuming you have this component

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("donor");
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { completeSignup, getUserData } = useAuth();

  // User data state
  const [userData, setUserData] = useState({
    // Basic info should be retrieved from Auth context or local storage
    // Role-specific details
    organizationName: "",
    contactNumber: "",
    address: "",
    website: "",
    location: {
      type: "Point",
      coordinates: [0, 0] // Default coordinates
    },
    foodPreferences: [],
    needsVolunteer: false,
    walletAddress: "",
    certificates: null,
    foodTypes: [],
    volunteerInterests: [],
    associatedNGO: ""
  });

  // Load basic user info on mount
  useEffect(() => {
    const basicInfo = getUserData();
    if (!basicInfo) {
      // If no data, user hasn't completed the first step
      navigate("/signup");
    }
  }, [navigate, getUserData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Filter userData based on role before submitting
      const filteredData = {
        role,
        ...filterDataByRole(userData, role)
      };
      
      const success = await completeSignup(filteredData, navigate);
      if (!success) {
        alert("Profile setup failed! Please try again.");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("An error occurred during profile setup.");
    } finally {
      setLoading(false);
    }
  };

  // Filter out irrelevant fields based on role
  const filterDataByRole = (data, role) => {
    const commonFields = ['organizationName', 'contactNumber', 'address', 'website', 'location'];
    const roleSpecificFields = {
      'donor': [...commonFields, 'foodTypes', 'walletAddress'],
      'NGO': [...commonFields, 'foodPreferences', 'needsVolunteer', 'certificates'],
      'volunteer': [...commonFields, 'volunteerInterests', 'associatedNGO'],
      'admin': commonFields
    };
    
    let filteredData = {};
    (roleSpecificFields[role] || commonFields).forEach(field => {
      filteredData[field] = data[field];
    });
    
    return filteredData;
  };

  // Update user data on input change
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setUserData({ ...userData, [name]: checked });
    } else if (type === 'file') {
      setUserData({ ...userData, [name]: files[0] });
    } else if (name === 'foodPreferences' || name === 'foodTypes' || name === 'volunteerInterests') {
      // Handle array fields
      const array = value.split(',').map(item => item.trim());
      setUserData({ ...userData, [name]: array });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  // Handle location selection
  const handleLocationSelect = (coordinates) => {
    setUserData({
      ...userData,
      location: {
        type: "Point",
        coordinates: coordinates
      }
    });
  };

  // Render form fields based on current step
  const renderFormFields = () => {
    if (step === 1) {
      // Step 1: Role Selection
      return (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Tell us about your role</h3>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">I am a</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="donor">Donor</option>
              <option value="NGO">NGO</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Next
            </button>
          </div>
        </>
      );
    } else {
      // Step 2: Role-specific fields
      return (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {role === "donor" ? "Donor Details" : 
             role === "NGO" ? "NGO Details" : 
             role === "volunteer" ? "Volunteer Details" : "Admin Details"}
          </h3>
          
          {/* Common fields for all roles */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              {role === "donor" || role === "NGO" ? "Organization Name" : "Full Name"}
            </label>
            <input
              type="text"
              name="organizationName"
              placeholder={role === "donor" || role === "NGO" ? "Enter organization name" : "Enter your full name"}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={userData.organizationName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter contact number"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={userData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter your address"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={userData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Website (Optional)</label>
            <input
              type="url"
              name="website"
              placeholder="Enter your website URL"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={userData.website}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Location</label>
            <div className="border border-gray-300 rounded-md h-48 mb-2">
              {/* Replace with your map component */}
              <MapPicker 
                onLocationSelect={handleLocationSelect} 
                currentLocation={userData.location.coordinates}
              />
            </div>
            <div className="text-xs text-gray-500">
              Click on the map to select your location
            </div>
          </div>
          
          {/* Role-specific fields */}
          {role === "donor" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Food Types You Usually Donate</label>
                <input
                  type="text"
                  name="foodTypes"
                  placeholder="E.g. cooked meals, vegetables, grains (comma separated)"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={userData.foodTypes.join(", ")}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Blockchain Wallet Address (Optional)</label>
                <input
                  type="text"
                  name="walletAddress"
                  placeholder="Enter your blockchain wallet address"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={userData.walletAddress}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">For receiving donation NFTs</p>
              </div>
            </>
          )}
          
          {role === "NGO" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Food Preferences (What you don't accept)</label>
                <input
                  type="text"
                  name="foodPreferences"
                  placeholder="E.g. meat, dairy, expired (comma separated)"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={userData.foodPreferences.join(", ")}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="needsVolunteer"
                    name="needsVolunteer"
                    className="rounded text-green-500 focus:ring-green-500 mr-2"
                    checked={userData.needsVolunteer}
                    onChange={handleChange}
                  />
                  <label htmlFor="needsVolunteer" className="text-gray-700 text-sm font-medium">
                    We need volunteer support
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Upload Certificates (Optional)</label>
                <input
                  type="file"
                  name="certificates"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">Registration certificates, licenses, etc.</p>
              </div>
            </>
          )}
          
          {role === "volunteer" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Interests</label>
                <input
                  type="text"
                  name="volunteerInterests"
                  placeholder="E.g. food delivery, cooking, packaging (comma separated)"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={userData.volunteerInterests.join(", ")}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Associated NGO (Optional)</label>
                <input
                  type="text"
                  name="associatedNGO"
                  placeholder="Enter NGO name if you're already associated with one"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={userData.associatedNGO}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? <><Loader className="w-4 h-4 mr-2" /> Creating Profile</> : "Complete Signup"}
            </button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="flex h-screen relative overflow-hidden bg-gradient-to-br from-orange-200 to-yellow-50">
      {/* Food Meteors Animation Background */}
      <FoodMeteors number={15} />
      
      {/* Form Section (60%) */}
      <div className="w-[60%] flex justify-center items-center z-10">
        <div className="transform scale-90 relative bg-white/80 backdrop-blur-sm p-8 shadow-lg rounded-lg w-[32rem]">
          <form onSubmit={handleSubmit} className="relative z-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
              Complete Your FoodLoop Profile
            </h2>
            
            {/* Progress indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-green-500 text-white' : 'bg-green-200 text-green-700'}`}>
                  1
                </div>
                <div className={`w-16 h-1 ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-green-500 text-white' : 'bg-green-200 text-green-700'}`}>
                  2
                </div>
              </div>
            </div>
            
            {renderFormFields()}
          </form>
        </div>
      </div>
      
      {/* Logo in center */}
      <div className="absolute z-50 top-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-white p-4 rounded-full shadow-lg">
          <img 
            src="/logo.png" 
            alt="FoodLoop Logo" 
            className="h-16 w-16 object-contain"
          />
        </div>
      </div>
      
      {/* Sidebar section (40%) with InfoSidebar button but no AppCard */}
      <div className="w-[40%] relative">
        {!showInfo ? (
          <div className="p-10 h-full flex flex-col justify-center">
            {/* Content area without AppCard */}
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-green-600 mb-4">Join our Food Rescue Mission</h2>
              <p className="text-gray-700 mb-3">
                FoodLoop connects food donors with NGOs and volunteers to reduce food waste and fight hunger.
              </p>
              <p className="text-gray-700 mb-3">
                Please complete your profile to get started with your role in our community.
              </p>
              <p className="text-gray-700">
                Need help? Click the info button to learn more about each role.
              </p>
            </div>
            
            {/* Info button */}
            <button 
              onClick={() => setShowInfo(true)}
              className="absolute bottom-6 right-6 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-all focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        ) : (
          <InfoSidebar onClose={() => setShowInfo(false)} />
        )}
      </div>
    </div>
  );
};

export default Onboarding;