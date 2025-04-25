import React, { useState } from "react";
import { CheckCircle, Clock, Circle } from "lucide-react";
import { FoodDistributionSidebar } from "../Components/MainPage/Sidebar";
import { useAuth } from "../context/AuthContext"; // Import useAuth

const steps = [
  { label: "Order Placed", timestamp: "Apr 18, 10:30 AM" },
  { label: "Processing", timestamp: "Apr 18, 11:00 AM" },
  { label: "Order PickedUp", timestamp: "Apr 19, 08:45 AM" },
  { label: "Out for Delivery", timestamp: "" },
  { label: "Delivered", timestamp: "" },
];

const DeliveryTimeline = ({ currentStep: initialStep, orderId }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const { hasRole, token } = useAuth(); // Get hasRole and token from AuthContext
  
  // Check if user is NGO or volunteer
  const canConfirmDelivery = hasRole('ngo') || hasRole('volunteer');
  
  const handleConfirmDelivery = async () => {
    if (!orderId) {
      setConfirmationMessage("Order ID is missing");
      return;
    }
    
    setIsConfirming(true);
    setConfirmationMessage("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/orders/${orderId}/confirm-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'delivered',
          deliveredAt: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the current step to "Delivered" (index 4)
        setCurrentStep(4);
        
        // Update the timestamp for the last step
        steps[4].timestamp = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
        
        setConfirmationMessage("Delivery confirmed successfully!");
      } else {
        setConfirmationMessage(`Failed to confirm delivery: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      setConfirmationMessage("Network error. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="flex h-screen bg-colour2">
      <div className="flex w-full flex-1 flex-col overflow-hidden border border-neutral-200 bg-colour2 md:flex-row">
        {/* Sidebar component */}
        <FoodDistributionSidebar />
        
        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col items-center py-8 px-4 bg-gradient-to-b from-colour2 to-white">
            <h1 className="text-3xl font-Birthstone text-4xl md:text-5xl font-bold text-colour1 mb-2">
              Delivery Status
            </h1>
            <p className="font-merriweather text-colour4 mb-6">Track your food donation journey in real-time</p>
            
            <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-colour3">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-colour3">
                <div>
                  <h2 className="text-2xl font-merriweather font-semibold text-colour4">
                    Delivery Timeline
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Order #{orderId || "DFD2204"}</p>
                </div>
                <div className="bg-colour1 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentStep < 4 ? "In Progress" : "Completed"}
                </div>
              </div>
              
              <ol className="relative border-l-[0.25rem] border-colour3 ml-4">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <li key={index} className="mb-8 ml-6 font-merriweather">
                      <span className="absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-colour3 shadow-sm">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-colour4" />
                        ) : isCurrent ? (
                          <Clock className="w-6 h-6 text-colour1 animate-pulse" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300" />
                        )}
                      </span>
                      <div className="ml-2">
                        <h3
                          className={`text-lg font-medium ${
                            isCompleted
                              ? "text-colour4"
                              : isCurrent
                              ? "text-colour1"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </h3>
                        {step.timestamp && (
                          <p className="text-sm text-gray-500">{step.timestamp}</p>
                        )}
                        {isCurrent && (
                          <p className="text-sm text-colour1 mt-1 italic">
                            {index === 0 ? "Your donation has been confirmed." : 
                             index === 1 ? "Food has been picked up from your location." :
                             index === 2 ? "Food is on the way to the recipient." :
                             index === 3 ? "Almost there! Delivery person is nearby." :
                             "Food has been successfully delivered."}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              
              <div className="mt-6 pt-4 border-t border-colour3 flex justify-between items-center">
                {currentStep === 4 ? (
                  <div className="flex items-center gap-2 text-colour4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium font-merriweather">Delivery completed</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm font-merriweather">
                    Estimated completion: 12:00 PM
                  </div>
                )}
                
                {/* Confirm Delivery Button - Only visible for NGO or volunteer users when delivery is in progress */}
                {currentStep === 3 && canConfirmDelivery && (
                  <button 
                    onClick={handleConfirmDelivery}
                    disabled={isConfirming}
                    className="px-6 py-2 bg-colour1 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirming ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Confirmation message */}
              {confirmationMessage && (
                <div className={`mt-4 p-3 rounded-md ${confirmationMessage.includes('Failed') || confirmationMessage.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {confirmationMessage}
                </div>
              )}
            </div>
            
            {/* Additional information card */}
            <div className="w-full max-w-2xl mx-auto mt-6 bg-white shadow-lg rounded-xl p-6 border border-colour3">
              <h3 className="text-xl font-Birthstone text-2xl font-semibold text-colour4 mb-4">Delivery Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-merriweather">
                <div>
                  <p className="text-sm text-colour4">Recipient</p>
                  <p className="font-medium">Helping Hands Foundation</p>
                </div>
                <div>
                  <p className="text-sm text-colour4">Contact</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm text-colour4">Delivery Address</p>
                  <p className="font-medium">123 Hope Street, Charity Avenue</p>
                </div>
                <div>
                  <p className="text-sm text-colour4">Food Type</p>
                  <p className="font-medium">Mixed meals - 8 servings</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-colour3">
                <p className="text-sm text-colour4 font-merriweather">Special Instructions</p>
                <p className="text-gray-700 font-merriweather">Please maintain food temperature. Call recipient 10 minutes before arrival.</p>
              </div>
            </div>
            
            {/* Inspirational quote */}
            <div className="mt-8 mb-4 text-center">
              <p className="font-rouge text-2xl italic text-colour4">"Every meal shared is a smile served"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTimeline;