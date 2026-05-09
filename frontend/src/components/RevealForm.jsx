import { useState } from "react";
import { ethers } from "ethers";
import { deploymentInfo, getContract, getSigner } from "../lib/auction.js";
import { loadBid } from "../lib/storage.js";

export default function RevealForm({ account, onChanged }) {
  const saved = loadBid(deploymentInfo.address, account.address);
  const [amountEth, setAmountEth] = useState(
    saved ? ethers.formatEther(saved.amountWei) : "",
  );
  const [secret, setSecret] = useState(saved?.secret ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const amountWei = ethers.parseEther(amountEth);
      const contract = getContract(getSigner(account.privateKey));
      const tx = await contract.reveal(amountWei, secret);
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
      <h3>Reveal your bid</h3>
      <p className="muted">
        {saved
          ? "Loaded from your browser. Click reveal to submit."
          : "No saved bid for this account. Paste your bid and secret to reveal."}
      </p>
      <form onSubmit={submit} className="stack">
        <label>
          Bid (ETH)
          <input
            type="number"
            step="0.01"
            min="0"
            value={amountEth}
            onChange={(e) => setAmountEth(e.target.value)}
            required
          />
        </label>
        <label>
          Secret
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={busy || !amountEth || !secret}>
          {busy ? "Revealing…" : "Reveal bid"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  );
}
