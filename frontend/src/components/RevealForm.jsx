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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="text-lg font-semibold text-zinc-50">Reveal your bid</h3>
      <p className="mt-1 text-sm text-zinc-400">
        {saved
          ? "Loaded from this browser. Click reveal to open your bid on-chain."
          : "No saved bid for this account. Paste your bid amount and secret to reveal."}
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-400">
            Bid (ETH)
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amountEth}
            onChange={(e) => setAmountEth(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-400">
            Secret
          </span>
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>

        <button
          type="submit"
          disabled={busy || !amountEth || !secret}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {busy ? "Revealing…" : "Reveal bid"}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </section>
  );
}
