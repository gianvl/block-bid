import { ethers } from "ethers";
import { deploymentInfo, PHASE } from "../lib/auction.js";
import { shortAddress } from "../lib/format.js";

function BidderRow({ bidder, isHighest, inReveal }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg bg-zinc-950/50 px-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-xs text-zinc-300">
          {shortAddress(bidder.address)}
        </span>
        <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          committed
        </span>
        {bidder.revealed ? (
          <span className="rounded-md bg-emerald-600/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            revealed
          </span>
        ) : (
          inReveal && (
            <span className="rounded-md bg-amber-600/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              not revealed
            </span>
          )
        )}
      </div>
      {bidder.revealed && (
        <span
          className={
            "tabular-nums text-sm font-semibold " +
            (isHighest ? "text-indigo-300" : "text-zinc-200")
          }
        >
          {ethers.formatEther(bidder.amount)} ETH
          {isHighest && (
            <span className="ml-1.5 text-[10px] font-bold uppercase text-indigo-400">
              high
            </span>
          )}
        </span>
      )}
    </li>
  );
}

export default function StatusPanel({ state }) {
  const inReveal = state.phase >= PHASE.Reveal;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        Auction
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
        {deploymentInfo.item}
      </h2>

      <dl className="mt-5 grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Deposit
          </dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-zinc-100">
            {ethers.formatEther(deploymentInfo.depositWei)} ETH
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Contract
          </dt>
          <dd className="mt-0.5 font-mono text-xs text-zinc-300">
            {shortAddress(deploymentInfo.address)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Auctioneer
          </dt>
          <dd className="mt-0.5 font-mono text-xs text-zinc-300">
            {shortAddress(deploymentInfo.auctioneer)}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">
          Bidders ({state.bidders.length})
        </h3>
        {state.bidders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-sm text-zinc-500">
            No commits yet.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {state.bidders.map((b) => (
              <BidderRow
                key={b.address}
                bidder={b}
                inReveal={inReveal}
                isHighest={
                  b.revealed &&
                  b.address.toLowerCase() ===
                    state.highestBidder.toLowerCase()
                }
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
