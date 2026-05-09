import { useState } from "react";
import { ethers } from "ethers";
import { getContract, getSigner } from "../lib/auction.js";

const ZERO = "0x0000000000000000000000000000000000000000";

function shortAddress(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WinnerPanel({ account, state, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const noWinner = state.highestBidder === ZERO;
  const youWon = state.highestBidder.toLowerCase() === account.address.toLowerCase();
  const pending = BigInt(state.myPendingReturn);

  async function withdraw() {
    setError(null);
    setBusy(true);
    try {
      const contract = getContract(getSigner(account.privateKey));
      const tx = await contract.withdraw();
      await tx.wait();
      onChanged();
    } catch (err) {
      setError(err.shortMessage || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h3>Result</h3>
      {noWinner ? (
        <p>No valid bids were revealed.</p>
      ) : (
        <p>
          Winner: <code>{shortAddress(state.highestBidder)}</code> at{" "}
          <strong>{ethers.formatEther(state.highestBid)} ETH</strong>
          {youWon && " — that's you."}
        </p>
      )}

      <h4>Your balance to withdraw</h4>
      <p>
        <strong>{ethers.formatEther(pending)} ETH</strong>
      </p>
      <button type="button" onClick={withdraw} disabled={busy || pending === 0n}>
        {busy ? "Withdrawing…" : "Withdraw"}
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
