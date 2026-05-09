import { useCallback, useEffect, useState } from "react";
import { getContract, PHASE } from "./lib/auction.js";
import { ACCOUNTS } from "./lib/accounts.js";
import AccountPicker from "./components/AccountPicker.jsx";
import StatusPanel from "./components/StatusPanel.jsx";
import CommitForm from "./components/CommitForm.jsx";
import RevealForm from "./components/RevealForm.jsx";
import AuctioneerControls from "./components/AuctioneerControls.jsx";
import WinnerPanel from "./components/WinnerPanel.jsx";
import PhaseStepper from "./components/PhaseStepper.jsx";

async function loadState(myAddress) {
  const c = getContract();
  const [phase, count, highestBidder, highestBid, myPendingReturn] =
    await Promise.all([
      c.phase(),
      c.bidderCount(),
      c.highestBidder(),
      c.highestBid(),
      c.pendingReturns(myAddress),
    ]);

  const bidders = await Promise.all(
    Array.from({ length: Number(count) }, async (_, i) => {
      const addr = await c.bidders(i);
      const b = await c.bids(addr);
      return { address: addr, revealed: b.revealed, amount: b.amount };
    }),
  );

  return {
    phase: Number(phase),
    bidders,
    highestBidder,
    highestBid,
    myPendingReturn,
  };
}

export default function App() {
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [state, setState] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setState(await loadState(account.address));
      setLoadError(null);
    } catch (err) {
      setLoadError(err.shortMessage || err.message);
    }
  }, [account.address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="bg-linear-to-r from-zinc-50 to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              BlockBid
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Sealed-bid auction with commit-reveal on a local Hardhat chain.
            </p>
          </div>
          <AccountPicker value={account} onChange={setAccount} />
        </header>

        {loadError && (
          <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
            <p className="font-semibold">Could not reach the contract</p>
            <p className="mt-1 text-red-400/90">{loadError}</p>
            <p className="mt-2 text-xs text-red-400/70">
              Make sure <code className="font-mono">npx hardhat node</code> is
              running and <code className="font-mono">scripts/deploy.js</code>{" "}
              has been executed.
            </p>
          </div>
        )}

        {state && (
          <>
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <PhaseStepper phase={state.phase} />
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <StatusPanel state={state} />
              <ActionPanel account={account} state={state} onChanged={refresh} />
            </div>
          </>
        )}

        <footer className="mt-10 text-center text-xs text-zinc-600">
          <code className="font-mono">localhost:8545</code> · Hardhat dev keys
          only · Not for live networks
        </footer>
      </div>
    </div>
  );
}

function ActionPanel({ account, state, onChanged }) {
  if (state.phase === PHASE.Ended) {
    return <WinnerPanel account={account} state={state} onChanged={onChanged} />;
  }

  if (account.role === "auctioneer") {
    return (
      <AuctioneerControls account={account} state={state} onChanged={onChanged} />
    );
  }

  const myCommit = state.bidders.find(
    (b) => b.address.toLowerCase() === account.address.toLowerCase(),
  );

  if (state.phase === PHASE.Commit) {
    if (myCommit) return <WaitingCard title="You've committed" body="Waiting for the commit phase to close, then reveal." />;
    return <CommitForm key={account.address} account={account} onChanged={onChanged} />;
  }

  // Reveal phase
  if (myCommit?.revealed) {
    return <WaitingCard title="You've revealed" body="Waiting for the reveal phase to close." />;
  }
  if (myCommit) {
    return <RevealForm key={account.address} account={account} onChanged={onChanged} />;
  }
  return (
    <WaitingCard
      title="You did not commit"
      body="Nothing to reveal for this account. Switch to a bidder that committed."
    />
  );
}

function WaitingCard({ title, body }) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="text-lg font-semibold text-zinc-50">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </section>
  );
}
