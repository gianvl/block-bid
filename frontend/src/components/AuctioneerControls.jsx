import { useState } from "react";
import { getContract, getSigner, PHASE } from "../lib/auction.js";

export default function AuctioneerControls({ account, state, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function advance() {
    setError(null);
    setBusy(true);
    try {
      const contract = getContract(getSigner(account.privateKey));
      const tx =
        state.phase === PHASE.Commit
          ? await contract.endCommitPhase()
          : await contract.endRevealPhase();
      await tx.wait();
      onChanged();
    } catch (err) {
      setError(err.shortMessage || err.message);
    } finally {
      setBusy(false);
    }
  }

  if (state.phase === PHASE.Ended) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-lg font-semibold text-zinc-50">Auctioneer</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Auction has ended. Bidders can withdraw their refunds and you can
          collect the winning bid.
        </p>
      </section>
    );
  }

  const committed = state.bidders.length;
  const revealed = state.bidders.filter((b) => b.revealed).length;
  const inCommit = state.phase === PHASE.Commit;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="text-lg font-semibold text-zinc-50">
        Auctioneer controls
      </h3>
      <p className="mt-1 text-sm text-zinc-400">
        {inCommit
          ? "Close commits and open the reveal window when bidders are ready."
          : "Close reveals and settle the auction. Non-revealers will forfeit their deposits."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Committed" value={committed} />
        <Stat label="Revealed" value={inCommit ? "—" : revealed} />
      </div>

      <button
        type="button"
        onClick={advance}
        disabled={busy}
        className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {busy
          ? "Submitting…"
          : inCommit
            ? "End commit phase"
            : "End reveal phase"}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
        {value}
      </p>
    </div>
  );
}
