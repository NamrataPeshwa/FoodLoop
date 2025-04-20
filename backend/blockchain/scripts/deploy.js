const hre = require("hardhat");

async function main() {
  console.log("Fetching FoodLoopNFT factory...");
  const FoodLoopNFT = await hre.ethers.getContractFactory("FoodLoopNFT");

  console.log("Deploying NFT...");
  const nft = await FoodLoopNFT.deploy();
  await nft.deployed();
  console.log("✅ NFT Contract deployed to:", nft.address);

  console.log("Fetching FoodLoop factory...");
  const FoodLoop = await hre.ethers.getContractFactory("FoodLoop");

  console.log("Deploying Main Contract...");
  const loop = await FoodLoop.deploy(nft.address);
  await loop.deployed();
  console.log("✅ Main Contract deployed to:", loop.address);
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exitCode = 1;
});
