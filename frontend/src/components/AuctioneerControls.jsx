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
      <section className="card">
        <h3>Auctioneer</h3>
        <p className="muted">Auction has ended.</p>
      </section>
    );
  }

  const next = state.phase === PHASE.Commit ? "Reveal" : "Ended";
  const label = state.phase === PHASE.Commit ? "End commit phase" : "End reveal phase";

  return (
    <section className="card">
      <h3>Auctioneer controls</h3>
      <p className="muted">Advance the auction to the {next} phase.</p>
      <button type="button" onClick={advance} disabled={busy}>
        {busy ? "Submitting…" : label}
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
