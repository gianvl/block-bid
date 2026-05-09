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

function tryCommitment(bidEth, secret, address) {
  if (!bidEth) return null;
  try {
    return makeCommitment(ethers.parseEther(bidEth), secret, address);
  } catch {
    return null;
  }
}

export default function CommitForm({ account, onChanged }) {
  const [bidEth, setBidEth] = useState("");
  const [secret] = useState(() => randomSecret());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const depositEth = ethers.formatEther(deploymentInfo.depositWei);
  const preview = tryCommitment(bidEth, secret, account.address);

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
      const tx = await contract.commit(commitment, {
        value: deploymentInfo.depositWei,
      });
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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="text-lg font-semibold text-zinc-50">Submit sealed bid</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Your bid is hashed locally with a random secret before being sent. The
        chain only sees the hash until you reveal.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label={`Bid (max ${depositEth} ETH)`}>
          <input
            type="number"
            step="0.01"
            min="0"
            max={depositEth}
            value={bidEth}
            onChange={(e) => setBidEth(e.target.value)}
            required
            placeholder="3.5"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </Field>

        <Field label="Secret (auto-generated, kept locally)">
          <input
            value={secret}
            readOnly
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-400"
          />
        </Field>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Commitment that will be sent
          </p>
          <p className="mt-1 break-all font-mono text-[11px] text-zinc-400">
            {preview ?? "Enter a bid to preview the hash"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-zinc-500">
            Holds {depositEth} ETH as deposit. Refunded if you don't win.
          </p>
          <button
            type="submit"
            disabled={busy || !bidEth}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {busy ? "Committing…" : "Commit bid"}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
