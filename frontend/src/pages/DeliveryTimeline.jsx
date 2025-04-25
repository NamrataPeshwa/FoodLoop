import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Circle, Info, ChevronRight, Award } from "lucide-react";
import { FoodDistributionSidebar } from "../Components/MainPage/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

// Status mapping to user-friendly labels
const statusLabels = {
  'pending': 'Order Placed',
  'requested': 'Processing',
  'picked_up': 'Order Picked Up',
  'in_transit': 'Out for Delivery',
  'delivered': 'Delivered',
  'confirmed': 'Verified & Completed'
};

// Status descriptions
const statusDescriptions = {
  'pending': 'Your donation has been confirmed.',
  'requested': 'NGO has requested pickup of your donation.',
  'picked_up': 'Food has been picked up from your location.',
  'in_transit': 'Food is on the way to the recipient.',
  'delivered': 'Food has been successfully delivered.',
  'confirmed': 'Delivery verified and NFT has been minted.'
};

// Status transition rules based on user role
const allowedTransitions = {
  'donor': {
    'pending': ['requested']
  },
  'ngo': {
    'pending': ['requested'],
    'picked_up': ['in_transit'],
    'in_transit': ['delivered'],
    'delivered': ['confirmed']
  },
  'volunteer': {
    'requested': ['picked_up'],
    'picked_up': ['in_transit'],
    'in_transit': ['delivered']
  },
  'admin': {
    'pending': ['requested', 'picked_up', 'in_transit', 'delivered', 'confirmed'],
    'requested': ['pending', 'picked_up', 'in_transit', 'delivered', 'confirmed'],
    'picked_up': ['pending', 'requested', 'in_transit', 'delivered', 'confirmed'],
    'in_transit': ['pending', 'requested', 'picked_up', 'delivered', 'confirmed'],
    'delivered': ['pending', 'requested', 'picked_up', 'in_transit', 'confirmed'],
    'confirmed': ['pending', 'requested', 'picked_up', 'in_transit', 'delivered']
  }
};

const DeliveryTimeline = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showNftModal, setShowNftModal] = useState(false);
  const [nftData, setNftData] = useState(null);
  const { hasRole, token, user } = useAuth();
  
  // Get user's role
  const userRole = hasRole('admin') ? 'admin' : 
                  hasRole('ngo') ? 'ngo' : 
                  hasRole('volunteer') ? 'volunteer' : 
                  hasRole('donor') ? 'donor' : null;

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Fetch timeline events from API
  useEffect(() => {
    const fetchTimelineEvents = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/orders/${orderId}/timeline`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTimelineEvents(data.events);
          
          // Find the latest status
          if (data.events && data.events.length > 0) {
            const latestEvent = [...data.events].sort((a, b) => 
              new Date(b.timestamp) - new Date(a.timestamp)
            )[0];
            setCurrentStatus(latestEvent.status);
          }
        } else {
          console.error("Failed to fetch timeline events");
        }
      } catch (error) {
        console.error("Error fetching timeline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelineEvents();
  }, [orderId, token]);

  // Prepare steps based on timeline events
  const prepareTimelineSteps = () => {
    // Define the status order
    const statusOrder = ['pending', 'requested', 'picked_up', 'in_transit', 'delivered', 'confirmed'];
    
    // Create a map of status -> event for quick lookup
    const eventsByStatus = {};
    timelineEvents.forEach(event => {
      // If there are multiple events with the same status, use the latest one
      if (!eventsByStatus[event.status] || 
          new Date(event.timestamp) > new Date(eventsByStatus[event.status].timestamp)) {
        eventsByStatus[event.status] = event;
      }
    });
    
    // Create steps array based on status order
    return statusOrder.map(status => {
      const event = eventsByStatus[status];
      
      return {
        status: status,
        label: statusLabels[status],
        timestamp: event ? formatDate(event.timestamp) : "",
        by: event ? event.by : "",
        note: event ? event.note : ""
      };
    });
  };

  const steps = prepareTimelineSteps();

  // Get the index of the current status
  const getCurrentStepIndex = () => {
    const statusOrder = ['pending', 'requested', 'picked_up', 'in_transit', 'delivered', 'confirmed'];
    return statusOrder.indexOf(currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  // Check if a status transition is allowed for the current user
  const canUpdateToStatus = (targetStatus) => {
    if (!userRole || !allowedTransitions[userRole]) return false;
    
    const allowed = allowedTransitions[userRole][currentStatus] || [];
    return allowed.includes(targetStatus);
  };

  // Handle clicking on a step to show action menu
  const handleStepClick = (index) => {
    // Only show action menu if this is a future step that's adjacent to current step
    const statusOrder = ['pending', 'requested', 'picked_up', 'in_transit', 'delivered', 'confirmed'];
    const clickedStatus = statusOrder[index];
    
    if (canUpdateToStatus(clickedStatus)) {
      setShowActionMenu(showActionMenu === index ? null : index);
    } else {
      setShowActionMenu(null);
    }
  };

  // Update status when clicked
  const handleUpdateStatus = async (newStatus) => {
    if (!orderId) {
      setStatusMessage("Order ID is missing");
      return;
    }
    
    if (!canUpdateToStatus(newStatus)) {
      setStatusMessage(`You don't have permission to update to ${statusLabels[newStatus]}`);
      return;
    }
    
    setIsUpdating(true);
    setStatusMessage("");
    setShowActionMenu(null);
    
    try {
      // Regular status update endpoint
      const endpoint = newStatus === 'confirmed' 
        ? `${import.meta.env.VITE_BACKEND_API}/api/orders/${orderId}/confirm-delivery`
        : `${import.meta.env.VITE_BACKEND_API}/api/orders/${orderId}/update-status`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          timestamp: new Date().toISOString(),
          by: userRole,
          note: `Status updated to ${newStatus} by ${userRole}`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add the new event to the timeline
        const newEvent = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          by: userRole,
          note: `Status updated to ${newStatus} by ${userRole}`
        };
        
        setTimelineEvents([...timelineEvents, newEvent]);
        setCurrentStatus(newStatus);
        
        // If this was a confirmation, we got back NFT data
        if (newStatus === 'confirmed' && data.nftData) {
          setNftData(data.nftData);
          setShowNftModal(true);
          setStatusMessage(`NFT minted successfully!`);
        } else {
          setStatusMessage(`Updated to ${statusLabels[newStatus]} successfully!`);
        }
      } else {
        setStatusMessage(`Failed to update status: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Calculate shortened hash for display
  const shortenHash = (hash) => {
    if (!hash) return "";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // NFT Modal component
  const NftSuccessModal = () => {
    if (!nftData) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <Award className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-colour4 mb-2">NFT Minted Successfully!</h3>
            <p className="text-gray-600 mb-6">Your contribution to food redistribution has been recorded on the blockchain</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="mb-3">
                <p className="text-sm text-gray-500">NFT Token ID</p>
                <p className="font-medium">{nftData.tokenId}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium font-mono">{shortenHash(nftData.transactionHash)}</p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(nftData.transactionHash)}
                    className="text-xs text-colour1 hover:text-amber-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blockchain</p>
                <p className="font-medium">{nftData.blockchain || "Sepolia Testnet"}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {nftData.explorerUrl && (
                <a 
                  href={nftData.explorerUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-colour4 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                >
                  View on Explorer
                </a>
              )}
              <button
                onClick={() => setShowNftModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-colour2">
      <div className="flex w-full flex-1 flex-col overflow-hidden border border-neutral-200 bg-colour2 md:flex-row">
        {/* Sidebar component */}
        <FoodDistributionSidebar />
        
        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col items-center py-8 px-4 bg-gradient-to-b from-colour2 to-white">
            <h1 className=" font-Birthstone text-4xl md:text-5xl font-bold text-colour1 mb-2">
              Delivery Status
            </h1>
            <p className="font-merriweather text-colour4 mb-6">Track your food donation journey in real-time</p>
            
            {isLoading ? (
              <div className="w-full max-w-2xl mx-auto flex justify-center p-10">
                <div className="w-10 h-10 border-4 border-colour1 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-colour3">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-colour3">
                  <div>
                    <h2 className="text-2xl font-merriweather font-semibold text-colour4">
                      Delivery Timeline
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Order #{orderId || "DFD2204"}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    currentStatus === 'confirmed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-colour1 text-white'
                  }`}>
                    {currentStatus === 'confirmed' ? 'Completed' : 'In Progress'}
                  </div>
                </div>
                
                {/* Role indicator - helpful for users to know what actions they can take */}
                {userRole && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="text-gray-700">
                      You are logged in as: <span className="font-semibold uppercase">{userRole}</span>
                      {userRole !== 'admin' && (
                        <span className="ml-1">
                          {userRole === 'donor' ? ' - You can submit new donations' : 
                           userRole === 'ngo' ? ' - You can request pickups and confirm deliveries' : 
                           userRole === 'volunteer' ? ' - You can update pickup and delivery status' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                {/* Timeline */}
                <ol className="relative border-l-[0.25rem] border-colour3 ml-4">
                  {steps.map((step, index) => {
                    const statusOrder = ['pending', 'requested', 'picked_up', 'in_transit', 'delivered', 'confirmed'];
                    const stepStatus = statusOrder[index];
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isClickable = canUpdateToStatus(stepStatus);
                    
                    return (
                      <li 
                        key={index} 
                        className={`mb-8 ml-6 font-merriweather relative ${isClickable ? 'cursor-pointer group' : ''}`}
                        onClick={isClickable ? () => handleStepClick(index) : undefined}
                      >
                        {/* Status indicator */}
                        <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 ${
                          isCompleted ? "border-colour4" : isCurrent ? "border-colour1" : "border-colour3"
                        } shadow-sm ${isClickable ? 'group-hover:ring-2 group-hover:ring-colour1 group-hover:ring-opacity-50' : ''}`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-colour4" />
                          ) : isCurrent ? (
                            <Clock className="w-6 h-6 text-colour1 animate-pulse" />
                          ) : (
                            <Circle className={`w-6 h-6 ${isClickable ? 'text-colour1 opacity-70' : 'text-gray-300'}`} />
                          )}
                        </span>
                        
                        {/* Step content */}
                        <div className={`ml-2 ${
                          isClickable ? 'group-hover:bg-amber-50 px-3 py-2 -mx-3 -my-2 rounded-lg transition-colors duration-150' : ''
                        }`}>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg font-medium ${
                                isCompleted
                                  ? "text-colour4"
                                  : isCurrent
                                  ? "text-colour1"
                                  : isClickable
                                  ? "text-colour1 opacity-80"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </h3>
                            {isClickable && (
                              <ChevronRight className="w-4 h-4 text-colour1 group-hover:opacity-100 opacity-60" />
                            )}
                          </div>
                          
                          {step.timestamp && (
                            <p className="text-sm text-gray-500">{step.timestamp}</p>
                          )}
                          
                          {step.by && step.timestamp && (
                            <p className="text-xs text-gray-400">Updated by: {step.by}</p>
                          )}
                          
                          {isCurrent && (
                            <p className="text-sm text-colour1 mt-1 italic">
                              {statusDescriptions[step.status]}
                            </p>
                          )}
                          
                          {step.note && (
                            <div className="flex items-start mt-1 text-sm text-gray-600">
                              <Info className="min-w-4 h-4 mr-1 mt-0.5" />
                              <p>{step.note}</p>
                            </div>
                          )}
                          
                          {/* Action menu for updating status */}
                          {showActionMenu === index && (
                            <div className="mt-2 p-3 bg-white border border-colour3 rounded-lg shadow-lg">
                              <p className="text-sm text-gray-600 mb-2">
                                Update status to <span className="font-semibold">{step.label}?</span>
                              </p>
                              {/* Special message for confirmation step */}
                              {stepStatus === 'confirmed' && (
                                <div className="p-2 bg-amber-50 text-amber-800 text-sm rounded mb-2">
                                  <p className="flex items-center">
                                    <Info className="w-4 h-4 mr-1" />
                                    This action will mint an NFT to permanently record this donation on the blockchain
                                  </p>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(stepStatus);
                                  }}
                                  disabled={isUpdating}
                                  className={`px-4 py-1.5 text-white rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1 shadow-sm disabled:opacity-50 ${
                                    stepStatus === 'confirmed' 
                                      ? 'bg-colour4 hover:bg-green-700' 
                                      : 'bg-colour1 hover:bg-amber-600'
                                  }`}
                                >
                                  {isUpdating ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      {stepStatus === 'confirmed' ? 'Minting...' : 'Updating...'}
                                    </>
                                  ) : (
                                    <>{stepStatus === 'confirmed' ? 'Confirm & Mint NFT' : 'Confirm'}</>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActionMenu(null);
                                  }}
                                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                
                <div className="mt-6 pt-4 border-t border-colour3">
                  {statusMessage && (
                    <div className={`mb-4 p-3 rounded-md ${statusMessage.includes('Failed') || statusMessage.includes('error') || statusMessage.includes('permission') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {statusMessage}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    {currentStatus === 'confirmed' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium font-merriweather">Delivery verified and completed</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm font-merriweather">
                        {timelineEvents.length > 0 ? (
                          `Last updated: ${formatDate(timelineEvents[timelineEvents.length - 1].timestamp)}`
                        ) : (
                          "Awaiting updates"
                        )}
                      </div>
                    )}
                    
                    {currentStatus !== 'confirmed' && userRole && (
                      <p className="text-sm text-colour1 italic">
                        Click on an available step to update the status
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional information card */}
            {!isLoading && (
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
            )}
            
            {/* NFT information card - only shown when confirmed */}
            {currentStatus === 'confirmed' && nftData && !showNftModal && (
              <div className="w-full max-w-2xl mx-auto mt-6 bg-white shadow-lg rounded-xl p-6 border border-colour3">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-Birthstone text-2xl font-semibold text-colour4">NFT Certificate</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-merriweather">
                  <div>
                    <p className="text-sm text-colour4">NFT Token ID</p>
                    <p className="font-medium">{nftData.tokenId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-colour4">Blockchain</p>
                    <p className="font-medium">{nftData.blockchain || "Sepolia Testnet"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-colour4">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono">{shortenHash(nftData.transactionHash)}</p>
                      <button 
                        onClick={() => navigator.clipboard.writeText(nftData.transactionHash)}
                        className="text-xs text-colour1 hover:text-amber-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-colour4">Minted On</p>
                    <p className="font-medium">{formatDate(nftData.mintedAt || new Date())}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-colour3 flex justify-end">
                  {nftData.explorerUrl && (
                    <a 
                      href={nftData.explorerUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-colour4 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      View on Blockchain Explorer
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Inspirational quote */}
            <div className="mt-8 mb-4 text-center">
              <p className="font-rouge text-2xl italic text-colour4">"Every meal shared is a smile served"</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* NFT Success Modal */}
      {showNftModal && <NftSuccessModal />}
    </div>
  );
};

export default DeliveryTimeline;