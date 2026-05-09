// End-to-end smoke test: drives a full auction against the deployed
// contract on a running Hardhat node, using the same deployment.json
// the frontend consumes. Run after `scripts/deploy.js` against a fresh
// deployment.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:8545";
const DEPLOYMENT_PATH = path.join(__dirname, "..", "frontend", "src", "deployment.json");

const KEYS = {
  auctioneer: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  alice: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  bob: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  carol: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
};

function makeCommitment(amountWei, secret, address) {
  const packed = ethers.solidityPacked(
    ["uint256", "bytes32", "address"],
    [amountWei, secret, address],
  );
  return ethers.sha256(packed);
}

function randomSecret() {
  return ethers.hexlify(ethers.randomBytes(32));
}

async function main() {
  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, "utf8"));
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const deposit = BigInt(deployment.depositWei);

  const wallets = Object.fromEntries(
    Object.entries(KEYS).map(([name, key]) => [name, new ethers.Wallet(key, provider)]),
  );
  const contract = (signer) =>
    new ethers.Contract(deployment.address, deployment.abi, signer);

  console.log(`Smoke testing ${deployment.address}`);

  let phase = await contract(provider).phase();
  assert.equal(Number(phase), 0, "expected fresh deployment in Commit phase");
  console.log("  starts in Commit phase");

  const bids = {
    alice: ethers.parseEther("3"),
    bob: ethers.parseEther("7"),
    carol: ethers.parseEther("5"),
  };
  const secrets = {
    alice: randomSecret(),
    bob: randomSecret(),
    carol: randomSecret(),
  };

  for (const name of ["alice", "bob", "carol"]) {
    const w = wallets[name];
    const commitment = makeCommitment(bids[name], secrets[name], w.address);
    const tx = await contract(w).commit(commitment, { value: deposit });
    await tx.wait();
  }
  console.log("  3 commits accepted");

  await (await contract(wallets.auctioneer).endCommitPhase()).wait();
  phase = await contract(provider).phase();
  assert.equal(Number(phase), 1);
  console.log("  advanced to Reveal phase");

  for (const name of ["alice", "bob", "carol"]) {
    const tx = await contract(wallets[name]).reveal(bids[name], secrets[name]);
    await tx.wait();
  }
  console.log("  3 reveals accepted");

  await (await contract(wallets.auctioneer).endRevealPhase()).wait();
  const winner = await contract(provider).highestBidder();
  const winningBid = await contract(provider).highestBid();
  assert.equal(winner.toLowerCase(), wallets.bob.address.toLowerCase());
  assert.equal(winningBid, bids.bob);
  console.log(`  winner: bob @ ${ethers.formatEther(winningBid)} ETH`);

  const ret = (addr) => contract(provider).pendingReturns(addr);
  assert.equal(await ret(wallets.alice.address), deposit);
  assert.equal(await ret(wallets.carol.address), deposit);
  assert.equal(await ret(wallets.bob.address), deposit - bids.bob);
  assert.equal(await ret(wallets.auctioneer.address), bids.bob);
  console.log("  pendingReturns match expected settlement");

  for (const name of ["alice", "bob", "carol", "auctioneer"]) {
    const tx = await contract(wallets[name]).withdraw();
    await tx.wait();
  }
  console.log("  all withdrawals succeeded");

  console.log("\nSmoke test passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
