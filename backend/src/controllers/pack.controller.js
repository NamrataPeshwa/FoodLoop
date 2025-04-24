import FoodListing from "../models/FoodListing.js";
import redis from "../utils/redis.js";
import { generatePackagingText, generatePackagingImage } from "../utils/geminiImagenUtils.js";

export const getPackagingSuggestions = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await FoodListing.findById(listingId).populate("donor");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const metadata = {
      foodType: listing.foodType,
      isPerishable: listing.isPerishable,
      weight: listing.weight,
      location: listing.location,
    };

    const prompt = `Suggest an eco-friendly packaging solution for a donation of ${metadata.weight} kg of ${metadata.foodType}. It's ${
      metadata.isPerishable ? "perishable" : "non-perishable"
    }. Include reusable or biodegradable options.`;

    // Gemini LLM for packaging advice
    const textResponse = await generatePackagingText(prompt);

    // Imagen (text-to-image) for visual packaging aid
    const imageUrl = await generatePackagingImage(`Eco-friendly packaging for ${metadata.foodType}`);

    const result = {
      suggestion: textResponse,
      visualGuide: imageUrl,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("Packaging suggestion error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
