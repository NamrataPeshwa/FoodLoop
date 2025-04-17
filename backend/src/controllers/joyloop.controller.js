import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import FoodListing from "../models/listing.model.js";

export const getJoySpreaders = async (req, res) => {
  try {
    const joySpreaders = await Transaction.aggregate([
      {
        $match: { volunteer: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: "$volunteer",
          spreadCount: { $sum: 1 }
        }
      },
      { $sort: { spreadCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "volunteerDetails"
        }
      },
      { $unwind: "$volunteerDetails" },
      {
        $project: {
          _id: 0,
          volunteerId: "$volunteerDetails._id",
          name: "$volunteerDetails.name",
          email: "$volunteerDetails.email",
          spreadCount: 1
        }
      }
    ]);

    return res.json(joySpreaders);
  } catch (err) {
    console.error("Error fetching joy spreaders:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getTopDonors = async (req, res) => {
  try {
    const topDonors = await FoodListing.aggregate([
      {
        $group: {
          _id: "$donor",
          totalDonations: { $sum: 1 }
        }
      },
      { $sort: { totalDonations: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "donorDetails"
        }
      },
      { $unwind: "$donorDetails" },
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


export const getJoyMoments = async (req, res) => {
  try {
    const moments = await FoodListing.find({
      caption: { $exists: true, $ne: "" }
    })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json(moments);
  } catch (err) {
    console.error("Error fetching joy moments:", err);
    res.status(500).json({ error: err.message });
  }
};
