import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Users, Leaf, Globe, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../Components/ui/Card'; 
import { FoodDistributionSidebar } from "../Components/MainPage/Sidebar";

const donationStats = [
  { month: 'Jan', donations: 120 },
  { month: 'Feb', donations: 160 },
  { month: 'Mar', donations: 220 },
  { month: 'Apr', donations: 310 },
];

const StyledCard = ({ className, children }) => {
  return (
    <div className={`rounded-lg shadow-xl ${className}`}>
      {children}
    </div>
  );
};

const StyledCardContent = ({ className, children }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

const ImpactReportPage = () => {
  // State for the dynamic stats that will come from backend
  const [impactStats, setImpactStats] = useState({
    totalDonations: 12340,
    totalWeight: 34000,
    estimatedCO2Saved: 12000,
    blockchainTransactions: 350,
    connectedNGOs: 80,
    testimonials: [
      { name: "Grace Home NGO", quote: "The donations from FoodLoop helped us feed 150 people last month. We feel seen and supported." },
      { name: "Akhil", role: "Volunteer", quote: "We've never had such transparency and ease with food donations before. The blockchain proof is game-changing." },
      { name: "John Doe", organizationName: "Food For All Foundation", quote: "The platform has transformed how we receive food donations, making the process more efficient and transparent." },
    ]
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch stats from the backend
  const fetchImpactStats = async () => {
    setIsLoading(true);
    try {
      // Commented out for now - will use when connecting to real backend
      // const response = await fetch('/api/impact/stats');
      // const data = await response.json();
      // setImpactStats(data);
      
      // Simulating API call delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching impact stats:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactStats();
  }, []);


  const AnimatedDiv = ({ children, className, delay = 0 }) => (
    <div 
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(-20px)',
        animation: `fadeIn 0.5s ease-out ${delay}s forwards`
      }}
    >
      {children}
    </div>
  );

  return (
    <>
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex w-full flex-1 flex-col overflow-hidden md:flex-row">
        {/* Sidebar component */}
        <FoodDistributionSidebar />
        
      
        <div className="flex flex-col w-full overflow-y-auto bg-gradient-to-br from-[#0b0c10] via-[#1f2833] to-[#FF5500] text-white font-serif">
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
            <AnimatedDiv className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-green-400 via-orange-500 to-black text-transparent bg-clip-text">
  Impact Report
</h1>
<p className="text-xl text-white/80 px-6 py-2 rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300/20 via-transparent to-green-300/5 shadow-[inset_0_0_20px_rgba(0,255,170,0.05)] backdrop-blur-md drop-shadow-lg animate-[pulse_5s_ease-in-out_infinite]">
  See how our platform is making a difference
</p>
            </AnimatedDiv>
            
            {/* 3D Card Feature */}
            <div className="flex justify-center mb-12">
              <Card 
                title="FOODLOOP IMPACT" 
                description={`${impactStats.totalWeight.toLocaleString()} kg of food saved, preventing ${impactStats.estimatedCO2Saved.toLocaleString()} kg CO₂ emissions`}
                imgSrc="/logo.png"
              />
            </div>
  
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StyledCard className="bg-green-500 text-white hover:scale-105 transition-transform">
                <StyledCardContent className="flex flex-col gap-3">
                  <Users className="h-6 w-6" />
                  <h3 className="text-xl font-bold">{isLoading ? '...' : `${impactStats.totalDonations.toLocaleString()}+`}</h3>
                  <p>Donations Completed</p>
                </StyledCardContent>
              </StyledCard>
              <StyledCard className="bg-teal-400 text-black hover:scale-105 transition-transform">
                <StyledCardContent className="flex flex-col gap-3">
                  <Leaf className="h-6 w-6" />
                  <h3 className="text-xl font-bold">{isLoading ? '...' : `${impactStats.totalWeight.toLocaleString()} kg`}</h3>
                  <p>Food Saved</p>
                </StyledCardContent>
              </StyledCard>
              <StyledCard className="bg-white text-black hover:scale-105 transition-transform">
                <StyledCardContent className="flex flex-col gap-3">
                  <Globe className="h-6 w-6 text-green-500" />
                  <h3 className="text-xl font-bold">{isLoading ? '...' : `${impactStats.connectedNGOs}+`}</h3>
                  <p>NGOs Connected</p>
                </StyledCardContent>
              </StyledCard>
              <StyledCard className="bg-black text-green-400 hover:scale-105 transition-transform">
                <StyledCardContent className="flex flex-col gap-3">
                  <Star className="h-6 w-6" />
                  <h3 className="text-xl font-bold">{isLoading ? '...' : `${impactStats.blockchainTransactions}+`}</h3>
                  <p>Blockchain Verified</p>
                </StyledCardContent>
              </StyledCard>
            </div>
  
            <div className="flex flex-col items-center">
              {/* Donation Trends */}
              <div className="w-full max-w-4xl text-center space-y-4">
                <h2 className="text-3xl font-bold text-white mb-4">Monthly Donation Trend</h2>
                <div className="bg-white rounded-2xl p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donationStats}>
                      <XAxis dataKey="month" stroke="#1f2833" />
                      <YAxis stroke="#1f2833" />
                      <Tooltip />
                      <Bar dataKey="donations" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
  
              {/* Blockchain Transparency */}
              <div className="w-full max-w-4xl text-center space-y-4 mt-8">
                <h2 className="text-3xl font-bold text-green-400">Blockchain Transparency</h2>
                <p className="text-lg text-white/80">
                  Every donation you make is recorded on the blockchain as proof of impact. We mint NFTs for completed donations to create a transparent, immutable record.
                </p>
                <a
                  href="https://sepolia.etherscan.io/address/0xcF8E0d025aeF7eFD74f6F84fCa5F60B416F9D01d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 underline inline-flex items-center hover:text-white"
                >
                  View on Etherscan <ArrowUpRight className="ml-1 h-4 w-4" />
                </a>
              </div>
  
              {/* Environmental Impact */}
              <div className="w-full max-w-4xl text-center space-y-4 mt-8">
                <h2 className="text-3xl font-bold text-green-400">Environmental Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StyledCard className="bg-black text-green-300 border border-green-500 hover:scale-105 transition-transform">
                    <StyledCardContent>
                      <h3 className="text-xl font-bold">CO₂ Prevented</h3>
                      <p className="text-2xl">{isLoading ? '...' : `${impactStats.estimatedCO2Saved.toLocaleString()}+ kg`}</p>
                    </StyledCardContent>
                  </StyledCard>
                  <StyledCard className="bg-black text-green-300 border border-green-500 hover:scale-105 transition-transform">
                    <StyledCardContent>
                      <h3 className="text-xl font-bold">Waste Diverted</h3>
                      <p className="text-2xl">{isLoading ? '...' : `${impactStats.totalWeight.toLocaleString()}+ kg`}</p>
                    </StyledCardContent>
                  </StyledCard>
                  <StyledCard className="bg-black text-green-300 border border-green-500 hover:scale-105 transition-transform">
                    <StyledCardContent>
                      <h3 className="text-xl font-bold">Meals Saved</h3>
                      <p className="text-2xl">{isLoading ? '...' : `${Math.floor(impactStats.totalWeight / 2).toLocaleString()}+`}</p>
                    </StyledCardContent>
                  </StyledCard>
                </div>
              </div>
  
              {/* Testimonials*/}
              <div className="w-full max-w-4xl text-center space-y-6 mt-8">
                <StyledCard className="bg-[#1f2833] border border-green-400">
                  <StyledCardContent>
                    <h3 className="text-2xl font-bold text-green-400 mb-4">Voices from the Ground</h3>
                    <div className="space-y-6">
                      {impactStats.testimonials.map((testimonial, index) => (
                        <div key={index} className="border-l-4 border-green-400 pl-4 py-2 text-left">
                          <p className="italic text-white/80">"{testimonial.quote}"</p>
                          <p className="mt-2 font-semibold text-green-300">
                            — {testimonial.name}
                            {testimonial.organizationName && `, ${testimonial.organizationName}`}
                            {testimonial.role && `, ${testimonial.role}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </StyledCardContent>
                </StyledCard>
                
                {/* Monthly Growth and User Trust Cards - Grid Layout for Better Centering */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <StyledCard className="bg-[#1f2833] text-white border border-teal-400">
                    <StyledCardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-teal-400">Monthly Growth</h3>
                      <p className="text-4xl font-bold text-white">+24%</p>
                      <p className="text-sm text-white/70">Donation increase over last month</p>
                    </StyledCardContent>
                  </StyledCard>
                  
                  <StyledCard className="bg-[#1f2833] text-white border border-teal-400">
                    <StyledCardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-teal-400">User Trust</h3>
                      <p className="text-4xl font-bold text-white">97%</p>
                      <p className="text-sm text-white/70">Positive feedback from donors</p>
                    </StyledCardContent>
                  </StyledCard>
                </div>
              </div>
            </div>
  
            {/* Call to Action*/}
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-bold text-green-400 mb-4">Join Us in Making a Difference</h2>
              <p className="text-lg text-white/80 mb-6">Together, we can reduce food waste and help those in need</p>
              <div className="flex justify-center space-x-4">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition">
                  Donate Food
                </button>
                <button className="bg-teal-400 hover:bg-teal-500 text-black font-bold py-3 px-6 rounded-lg transition">
                  Register as NGO
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <style jsx>{`
      @keyframes fadeIn {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
    </>
  );
};

export default ImpactReportPage;