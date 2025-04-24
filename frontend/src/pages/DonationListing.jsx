import React from "react";
import { MapPin, AlarmClock, UserRound } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FoodDistributionSidebar } from "../Components/MainPage/Sidebar";

const DonationCard = ({ donation, isNGO }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden w-full h-fit max-w-sm">
      <div className="w-full h-56 bg-gray-100">
        {donation.images.length > 1 ? (
          <Slider {...settings}>
            {donation.images.map((img, idx) => (
              <img key={idx} src={img} alt="donation" className="w-full h-56 object-cover" />
            ))}
          </Slider>
        ) : (
          <img src={donation.images[0]} alt="donation" className="w-full h-56 object-cover" />
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-700 font-medium uppercase">{donation.foodType}</span>
          <span className="text-xs px-2 py-1 bg-red-100 text-red-500 rounded-full font-medium">
            {donation.tags.join(", ")}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600 gap-1">
        <UserRound className="w-4 h-4" />
        <span>{donation.name}</span>

        </div>

        <div className="flex items-center text-sm text-gray-600 gap-1">
          <MapPin className="w-4 h-4" />
          <span>{donation.location}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 gap-1">
          <AlarmClock className="w-4 h-4" />
          <span>Expires: {donation.expiryDate}</span>
        </div>

        {isNGO && (
          <button className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition duration-200">
            Claim
          </button>
        )}
      </div>
    </div>
  );
};

const DonationList = ({ donations, isNGO }) => {
  const sampleDonations = [
    {
      images: [
        "./card1.png",
        "./card2.png"
      ],
      foodType: "Hot Meal",
      name: "laaaaa",
      tags: ["Perishable", "Urgent"],
      location: "Delhi, India",
      expiryDate: "2025-04-21 18:00",
    },
    {
      images: [
       
      ],
      foodType: "Fruits",
      name : "baaaa",
      tags: ["Packaged"],
      location: "Mumbai, India",
      expiryDate: "2025-04-20 14:00",
    },
    {
      images: [
        
      ],
      foodType: "Vegetables",
      name : "gaaaaa",
      tags: ["Fresh", "Urgent"],
      location: "Bangalore, India",
      expiryDate: "2025-04-19 10:30",
    }
  ];
  const [donations, setDonations] = React.useState(sampleDonations);
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API}/api/donations/list`);
        if (res.data && res.data.data) {
          setDonations(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching donations:", err);
      }
    };
  
    fetchDonations();
  }, []);

  const dataToRender = donations && donations.length > 0 ? donations : sampleDonations;

  return (
    <>
     <div className="flex h-screen bg-colour3">
     <div className="flex w-full flex-1 flex-col overflow-hidden border border-neutral-200  md:flex-row ">
       <FoodDistributionSidebar />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
     
      {dataToRender.map((donation, idx) => (
        <DonationCard key={idx} donation={donation} isNGO={isNGO} />
      ))}
    </div>
    </div>
    </div>
    </>
  );
};

export default DonationList;
