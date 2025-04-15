"use client";
import React, { useState, lazy, Suspense, useEffect } from "react";
import { motion } from "motion/react";

// Changed the import pattern to properly handle the module
const World = lazy(() => 
  import("../ui/globe").then(module => ({ default: module.World })), 
  { ssr: false }
);

// Error boundary to catch and display any errors in the rendering process
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-4 text-center">Error loading globe: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export function FoodDonationGlobe() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add debug logging
  useEffect(() => {
    console.log("FoodDonationGlobe mounted");
    return () => console.log("FoodDonationGlobe unmounted");
  }, []);

  // Updated globe configuration for food donation theme
  const globeConfig = {
    pointSize: 4,
    globeColor: "#1e5631", // Earthy green color
    showAtmosphere: true,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#1e5631",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#f59e0b", // Warm amber light
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 0, lng: 0 }, // Start centered
    autoRotate: true,
    autoRotateSpeed: 0.3,
    onRegionHover: (region) => {
      if (region) {
        setSelectedRegion(region);
      } else {
        setSelectedRegion(null);
      }
    },
    onRegionClick: (region) => {
      if (region) {
        setSelectedRegion(region);
        setShowDonateModal(true);
      }
    }
  };

  // Food insecurity data by region with donation impact info
  const foodInsecurityData = [
    {
      id: "sahel",
      region: "Sahel Region",
      startLat: 14.4974,
      startLng: 0.1479,
      insecurityLevel: "Severe",
      affectedPopulation: "10.5 million",
      donationImpact: "$10 provides 40 meals",
      color: "#dc2626", // Red for severe
      description: "Facing extreme drought and conflict-driven hunger crisis"
    },
    {
      id: "southsudan",
      region: "South Sudan",
      startLat: 6.8770,
      startLng: 31.3070,
      insecurityLevel: "Critical",
      affectedPopulation: "7.2 million",
      donationImpact: "$25 feeds a family for a week",
      color: "#991b1b", // Darker red for critical
      description: "Ongoing conflict has led to widespread food shortages"
    },
    {
      id: "yemen",
      region: "Yemen",
      startLat: 15.5527,
      startLng: 48.5164,
      insecurityLevel: "Critical",
      affectedPopulation: "16.2 million",
      donationImpact: "$50 provides emergency nutrition",
      color: "#991b1b",
      description: "Conflict has severely disrupted food distribution networks"
    },
    {
      id: "haiti",
      region: "Haiti",
      startLat: 18.9712,
      startLng: -72.2852,
      insecurityLevel: "Severe",
      affectedPopulation: "4.4 million",
      donationImpact: "$15 supplies emergency food aid",
      color: "#dc2626",
      description: "Political instability and natural disasters have created food shortages"
    },
    {
      id: "madagascar",
      region: "Southern Madagascar",
      startLat: -23.6980,
      startLng: 44.5452,
      insecurityLevel: "Severe",
      affectedPopulation: "1.3 million",
      donationImpact: "$30 provides drought-resistant seeds",
      color: "#dc2626",
      description: "Climate change has caused severe drought and crop failures"
    },
    {
      id: "afghanistan",
      region: "Afghanistan",
      startLat: 33.9391,
      startLng: 67.7100,
      insecurityLevel: "Critical",
      affectedPopulation: "22.8 million",
      donationImpact: "$20 provides emergency food packages",
      color: "#991b1b",
      description: "Economic collapse has led to widespread hunger"
    },
    {
      id: "venezuela",
      region: "Venezuela",
      startLat: 6.4238,
      startLng: -66.5897,
      insecurityLevel: "High",
      affectedPopulation: "9.3 million",
      donationImpact: "$35 feeds a family for two weeks",
      color: "#f59e0b", // Amber for high
      description: "Economic crisis has created widespread food insecurity"
    },
    {
      id: "syria",
      region: "Syria",
      startLat: 34.8021,
      startLng: 38.9968,
      insecurityLevel: "Severe",
      affectedPopulation: "12.4 million",
      donationImpact: "$45 provides essential nutrition",
      color: "#dc2626",
      description: "Conflict has disrupted agricultural production and food supply"
    },
    {
      id: "ethiopia",
      region: "Tigray, Ethiopia",
      startLat: 14.0456,
      startLng: 38.3147,
      insecurityLevel: "Critical",
      affectedPopulation: "5.2 million",
      donationImpact: "$15 provides emergency food aid",
      color: "#991b1b",
      description: "Conflict has severely restricted access to food"
    },
    {
      id: "drc",
      region: "DR Congo",
      startLat: -4.0383,
      startLng: 21.7587,
      insecurityLevel: "Severe",
      affectedPopulation: "27 million",
      donationImpact: "$30 provides nutritional supplements",
      color: "#dc2626",
      description: "Conflict and displacement have created a hunger crisis"
    },
    {
      id: "honduras",
      region: "Honduras",
      startLat: 15.2000,
      startLng: -86.2419,
      insecurityLevel: "High",
      affectedPopulation: "3.3 million",
      donationImpact: "$25 provides sustainable farming tools",
      color: "#f59e0b",
      description: "Natural disasters have disrupted food production"
    },
    {
      id: "bangladesh",
      region: "Cox's Bazar, Bangladesh",
      startLat: 21.4272,
      startLng: 92.0046,
      insecurityLevel: "High",
      affectedPopulation: "1.2 million",
      donationImpact: "$20 provides meals for refugee families",
      color: "#f59e0b",
      description: "Refugee crisis has created food shortages"
    }
  ];

  // Create arcs that represent food distribution routes
  const distributionRoutes = [
    // From major food production/export regions to food insecure regions
    {
      order: 1,
      startLat: 39.8283, // USA
      startLng: -98.5795,
      endLat: 14.4974, // Sahel
      endLng: 0.1479,
      arcAlt: 0.3,
      color: "#10b981", // Green for distribution
    },
    {
      order: 1,
      startLat: 35.8617, // Europe/France
      startLng: 104.1954,
      endLat: 6.8770, // South Sudan
      endLng: 31.3070,
      arcAlt: 0.2,
      color: "#10b981",
    },
    {
      order: 2,
      startLat: -25.2744, // Australia
      startLng: 133.7751,
      endLat: -23.6980, // Madagascar
      endLng: 44.5452,
      arcAlt: 0.2,
      color: "#10b981",
    },
    {
      order: 2,
      startLat: 20.5937, // India
      startLng: 78.9629,
      endLat: 33.9391, // Afghanistan
      endLng: 67.7100,
      arcAlt: 0.1,
      color: "#10b981",
    },
    {
      order: 3,
      startLat: 56.1304, // Canada
      startLng: -106.3468,
      endLat: 34.8021, // Syria
      endLng: 38.9968,
      arcAlt: 0.4,
      color: "#10b981",
    },
    {
      order: 3,
      startLat: -14.2350, // Brazil
      startLng: -51.9253,
      endLat: 6.4238, // Venezuela
      endLng: -66.5897,
      arcAlt: 0.1,
      color: "#10b981",
    },
    {
      order: 4,
      startLat: 35.8617, // China
      startLng: 104.1954,
      endLat: 15.5527, // Yemen
      endLng: 48.5164,
      arcAlt: 0.3,
      color: "#10b981",
    },
    {
      order: 4,
      startLat: 51.1657, // UK
      startLng: -10.4515,
      endLat: 18.9712, // Haiti
      endLng: -72.2852,
      arcAlt: 0.2,
      color: "#10b981",
    }
  ];

  // Combine food insecurity data points and distribution routes
  const globeData = [...foodInsecurityData, ...distributionRoutes];
  
  console.log("Rendering FoodDonationGlobe", { globeData: globeData.length });

  // Function to handle donation
  const handleDonate = () => {
    // Here you would integrate with your payment processing
    alert(`Thank you for donating to help people in ${selectedRegion.region}!`);
    setShowDonateModal(false);
  };

  // Function to handle globe loading status
  const handleGlobeLoaded = () => {
    console.log("Globe loaded successfully");
    setIsLoading(false);
  };
  const sanitizeCoordinates = (data) => {
    return data.map(item => {
      const sanitized = {...item};
      
      // Validate coordinates to ensure they're valid numbers
      sanitized.startLat = Number(sanitized.startLat) || 0;
      sanitized.startLng = Number(sanitized.startLng) || 0;
      
      // Handle arcs
      if ('endLat' in sanitized) sanitized.endLat = Number(sanitized.endLat) || 0;
      if ('endLng' in sanitized) sanitized.endLng = Number(sanitized.endLng) || 0;
      if ('arcAlt' in sanitized) sanitized.arcAlt = Number(sanitized.arcAlt) || 0.1;
      
      return sanitized;
    });
  };
  const sanitizedGlobeData = sanitizeCoordinates(globeData);


  return (
    <div className="flex flex-col items-center justify-center py-5 h-screen md:h-auto dark:bg-black bg-white relative w-full">
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className="div"
        >
          <h2 className="text-center text-xl md:text-4xl font-bold text-black dark:text-white">
            Food Insecurity Around the World
          </h2>
          <p className="text-center text-base md:text-lg font-normal text-neutral-700 dark:text-neutral-200 max-w-md mt-2 mx-auto">
            Hover over highlighted regions to see hunger statistics. Click on any region to make a donation and help end food insecurity.
          </p>
        </motion.div>
  
        {/* Region information tooltip that appears on hover */}
        {selectedRegion && !showDonateModal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute md:top-32 top-40 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-80"
          >
            <h3 className="font-bold text-lg">{selectedRegion.region}</h3>
            <div className="flex items-center mt-1">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: selectedRegion.color }}
              />
              <span className="font-medium">{selectedRegion.insecurityLevel} Food Insecurity</span>
            </div>
            <p className="mt-2 text-sm">{selectedRegion.description}</p>
            <p className="mt-1 text-sm"><strong>Affected:</strong> {selectedRegion.affectedPopulation} people</p>
            <p className="mt-1 text-sm"><strong>Impact:</strong> {selectedRegion.donationImpact}</p>
            <button
              onClick={() => setShowDonateModal(true)}
              className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Donate Now
            </button>
          </motion.div>
        )}
  
        {/* Donation modal that appears on click */}
        {showDonateModal && selectedRegion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold">Donate to {selectedRegion.region}</h3>
              <p className="mt-2">{selectedRegion.description}</p>
              <p className="mt-4 font-medium">How much would you like to donate?</p>
  
              <div className="grid grid-cols-3 gap-3 mt-3">
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 py-2 rounded-md transition-colors">$10</button>
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 py-2 rounded-md transition-colors">$25</button>
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 py-2 rounded-md transition-colors">$50</button>
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 py-2 rounded-md transition-colors">$100</button>
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 py-2 rounded-md transition-colors">$250</button>
                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 py-2 rounded-md transition-colors">Other</button>
              </div>
  
              <p className="mt-4 text-sm">{selectedRegion.donationImpact}</p>
  
              <div className="flex mt-6 space-x-3">
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDonate}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Donate Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
  
        <div className="absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent dark:to-black to-white z-100" />
        
        {/* Increased height to ensure globe is visible */}
        <div className="absolute w-full -bottom-20 h-96 md:h-full z-30">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-4 text-lg font-medium text-black dark:text-white">Loading interactive globe...</p>
                </div>
              </div>
            }>
              <World 
                data={sanitizedGlobeData} 
                globeConfig={globeConfig} 
                onLoad={handleGlobeLoaded}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
  
    </div>
    
  );
}