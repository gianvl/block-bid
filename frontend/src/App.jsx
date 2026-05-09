import { ethers } from "ethers";
import { deploymentInfo } from "./lib/auction.js";
import { ACCOUNTS } from "./lib/accounts.js";

export default function App() {
  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>BlockBid</h1>
      <p>Sealed-bid auction with commit-reveal on a local Hardhat chain.</p>

      <section>
        <h2>Deployment</h2>
        <ul>
          <li>
            <strong>Item:</strong> {deploymentInfo.item}
          </li>
          <li>
            <strong>Contract:</strong>{" "}
            <code>{deploymentInfo.address}</code>
          </li>
          <li>
            <strong>Deposit:</strong>{" "}
            {ethers.formatEther(deploymentInfo.depositWei)} ETH
          </li>
          <li>
            <strong>Auctioneer:</strong>{" "}
            <code>{deploymentInfo.auctioneer}</code>
          </li>
        </ul>

        <h2>Accounts available</h2>
        <ul>
          {ACCOUNTS.map((a) => (
            <li key={a.address}>
              {a.label} — <code>{a.address}</code>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ opacity: 0.7 }}>
        Wallet wiring imported. Auction UI lands in the next commit.
      </p>
    </main>
  );
}
