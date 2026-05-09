import { useState } from "react";
import { ethers } from "ethers";
import {
  deploymentInfo,
  getContract,
  getSigner,
  makeCommitment,
  randomSecret,
} from "../lib/auction.js";
import { saveBid } from "../lib/storage.js";

export default function CommitForm({ account, onChanged }) {
  const [bidEth, setBidEth] = useState("");
  const [secret] = useState(() => randomSecret());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const depositEth = ethers.formatEther(deploymentInfo.depositWei);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const amountWei = ethers.parseEther(bidEth);
      if (amountWei > BigInt(deploymentInfo.depositWei)) {
        throw new Error(`Bid must be at most ${depositEth} ETH (the deposit).`);
      }
      const commitment = makeCommitment(amountWei, secret, account.address);
      const contract = getContract(getSigner(account.privateKey));
      const tx = await contract.commit(commitment, { value: deploymentInfo.depositWei });
      await tx.wait();
      saveBid(deploymentInfo.address, account.address, { amountWei, secret });
      onChanged();
    } catch (err) {
      setError(err.shortMessage || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h3>Submit sealed bid</h3>
      <p className="muted">
        Your bid is hashed locally with a random secret before being sent — the
        chain only sees the hash until the reveal phase.
      </p>
      <form onSubmit={submit} className="stack">
        <label>
          Bid (ETH)
          <input
            type="number"
            step="0.01"
            min="0"
            max={depositEth}
            value={bidEth}
            onChange={(e) => setBidEth(e.target.value)}
            required
          />
        </label>
        <label>
          Secret (auto-generated, saved locally)
          <input value={secret} readOnly />
        </label>
        <p className="muted">
          A deposit of {depositEth} ETH is held by the contract. Bid must be ≤
          deposit; the difference is refunded if you win.
        </p>
        <button type="submit" disabled={busy || !bidEth}>
          {busy ? "Committing…" : "Commit bid"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  );
}
