const fs = require("node:fs");
const path = require("node:path");
const { ethers, artifacts } = require("hardhat");

const ITEM = "Vintage signed first edition";
const DEPOSIT_ETH = "10";

async function main() {
  const [auctioneer] = await ethers.getSigners();
  const deposit = ethers.parseEther(DEPOSIT_ETH);

  const Auction = await ethers.getContractFactory("BlockBidAuction");
  const auction = await Auction.connect(auctioneer).deploy(ITEM, deposit);
  await auction.waitForDeployment();

  const address = await auction.getAddress();
  const { abi } = await artifacts.readArtifact("BlockBidAuction");

  const out = {
    address,
    abi,
    item: ITEM,
    depositWei: deposit.toString(),
    auctioneer: auctioneer.address,
  };

  const target = path.join(__dirname, "..", "frontend", "src", "deployment.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(out, null, 2));

  console.log(`BlockBidAuction deployed at ${address}`);
  console.log(`Auctioneer: ${auctioneer.address}`);
  console.log(`Deposit:    ${DEPOSIT_ETH} ETH`);
  console.log(`Wrote ${target}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
