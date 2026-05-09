import { ethers } from "ethers";
import { deploymentInfo, PHASE } from "../lib/auction.js";
import PhaseBadge from "./PhaseBadge.jsx";

function shortAddress(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function StatusPanel({ state }) {
  const inReveal = state.phase >= PHASE.Reveal;
  return (
    <section className="card">
      <header className="row between">
        <h2>{deploymentInfo.item}</h2>
        <PhaseBadge phase={state.phase} />
      </header>
      <p className="muted">
        Deposit {ethers.formatEther(deploymentInfo.depositWei)} ETH per bidder. Contract{" "}
        <code>{shortAddress(deploymentInfo.address)}</code>.
      </p>

      <h3>Bidders ({state.bidders.length})</h3>
      {state.bidders.length === 0 && <p className="muted">No commits yet.</p>}
      <ul className="bidders">
        {state.bidders.map((b) => (
          <li key={b.address}>
            <code>{shortAddress(b.address)}</code>
            <span className="tag">committed</span>
            {b.revealed ? (
              <>
                <span className="tag tag-ok">revealed</span>
                <span className="amount">{ethers.formatEther(b.amount)} ETH</span>
              </>
            ) : (
              inReveal && <span className="tag tag-warn">not revealed</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
