const getJoySpreaders = async (req, res) => {
    try {
      const joySpreaders = await Donation.aggregate([
        {
          $match: { volunteer: { $exists: true } },
        },
        {
          $group: {
            _id: "$volunteer",
            spreadCount: { $sum: 1 },
          },
        },
        { $sort: { spreadCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "volunteerDetails",
          },
        },
        { $unwind: "$volunteerDetails" },
        {
          $project: {
            _id: 0,
            volunteerId: "$volunteerDetails._id",
            name: "$volunteerDetails.name",
            email: "$volunteerDetails.email",
            spreadCount: 1,
          },
        },
      ]);
      return res.json(joySpreaders);
    } catch (err) {
      console.error("Error fetching joy spreaders:", err);
      res.status(500).json({ error: err.message });
    }
  };

  const getTopDonors = async (req, res) => {
    try {
      const topDonors = await Donation.aggregate([
        {
  
  $group: {
    _id: "$donorId",
    totalDonations: { $sum: 1 },
  },
},
{
  $sort: { totalDonations: -1 }
},
{
  $limit: 10 // top 10 donors
},
{
  $lookup: {
    from: "users", // Make sure it's the actual collection name (usually lowercase plural)
    localField: "_id",
    foreignField: "_id",
    as: "donorDetails"
  }
},
{
  $unwind: "$donorDetails"
},
{
  $project: {
    _id: 0,
    donorId: "$donorDetails._id",
    name: "$donorDetails.name",
    email: "$donorDetails.email",
    totalDonations: 1
  }
}
]);

res.json(topDonors);
} catch (err) {
console.error("Error fetching top donors", err);
res.status(500).json({ error: "Server error fetching top donors" });
}
};
  

const FoodListing = require("../models/foodListing"); // Schema for donation listings
const Donation = require("../models/donationTransaction"); // For tracking donations
const User = require("../models/user");

/**
 * Get recent "Joy Moments" (food listings with a non-empty caption)
 */
const getJoyMoments = async (req, res) => {
  try {
    // Assuming a 'caption' field exists on FoodListing to denote a joy story.
    const moments = await FoodListing.find({ caption: { $exists: true, $ne: "" } })
      .sort({ createdAt: -1 })
      .limit(30);
    return res.json(moments);
  } catch (err) {
    console.error("Error fetching joy moments:", err);
    res.status(500).json({ error: err.message });
  }
};
