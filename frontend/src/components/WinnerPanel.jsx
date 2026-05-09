import { useState } from "react";
import { ethers } from "ethers";
import { getContract, getSigner } from "../lib/auction.js";
import { isZeroAddress, shortAddress } from "../lib/format.js";

export default function WinnerPanel({ account, state, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const noWinner = isZeroAddress(state.highestBidder);
  const youWon =
    !noWinner &&
    state.highestBidder.toLowerCase() === account.address.toLowerCase();
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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        Result
      </p>
      {noWinner ? (
        <p className="mt-1 text-base text-zinc-300">
          No valid bids were revealed.
        </p>
      ) : (
        <div className="mt-1">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-50">
            {ethers.formatEther(state.highestBid)} ETH
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Won by{" "}
            <span className="font-mono text-zinc-300">
              {shortAddress(state.highestBidder)}
            </span>
            {youWon && (
              <span className="ml-2 rounded-md bg-indigo-600/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                you
              </span>
            )}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Available to withdraw
          </p>
          <p className="text-xl font-semibold tabular-nums text-zinc-100">
            {ethers.formatEther(pending)} ETH
          </p>
        </div>
        <button
          type="button"
          onClick={withdraw}
          disabled={busy || pending === 0n}
          className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {busy ? "Withdrawing…" : "Withdraw"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  );
}
