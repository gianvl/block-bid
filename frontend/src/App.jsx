import { useCallback, useEffect, useState } from "react";
import { getContract, PHASE } from "./lib/auction.js";
import { ACCOUNTS } from "./lib/accounts.js";
import AccountPicker from "./components/AccountPicker.jsx";
import StatusPanel from "./components/StatusPanel.jsx";
import CommitForm from "./components/CommitForm.jsx";
import RevealForm from "./components/RevealForm.jsx";
import AuctioneerControls from "./components/AuctioneerControls.jsx";
import WinnerPanel from "./components/WinnerPanel.jsx";

async function loadState(myAddress) {
  const c = getContract();
  const [phase, count, highestBidder, highestBid, myPendingReturn] = await Promise.all([
    c.phase(),
    c.bidderCount(),
    c.highestBidder(),
    c.highestBid(),
    c.pendingReturns(myAddress),
  ]);

  const bidderCount = Number(count);
  const bidders = await Promise.all(
    Array.from({ length: bidderCount }, async (_, i) => {
      const addr = await c.bidders(i);
      const b = await c.bids(addr);
      return {
        address: addr,
        revealed: b.revealed,
        amount: b.amount,
      };
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

  const myCommit = state?.bidders.find(
    (b) => b.address.toLowerCase() === account.address.toLowerCase(),
  );

  return (
    <main>
      <header className="topbar">
        <h1>BlockBid</h1>
        <AccountPicker value={account} onChange={setAccount} />
      </header>

      {loadError && (
        <p className="error">
          Could not reach the contract: {loadError}. Is the Hardhat node running and
          has <code>scripts/deploy.js</code> been executed?
        </p>
      )}

      {state && (
        <div className="grid">
          <StatusPanel state={state} />

          {account.role === "auctioneer" ? (
            <AuctioneerControls account={account} state={state} onChanged={refresh} />
          ) : state.phase === PHASE.Commit ? (
            myCommit ? (
              <section className="card">
                <h3>You've committed</h3>
                <p className="muted">
                  Waiting for the commit phase to close, then reveal.
                </p>
              </section>
            ) : (
              <CommitForm key={account.address} account={account} onChanged={refresh} />
            )
          ) : state.phase === PHASE.Reveal ? (
            myCommit?.revealed ? (
              <section className="card">
                <h3>You've revealed</h3>
                <p className="muted">Waiting for the reveal phase to close.</p>
              </section>
            ) : myCommit ? (
              <RevealForm key={account.address} account={account} onChanged={refresh} />
            ) : (
              <section className="card">
                <h3>You did not commit</h3>
                <p className="muted">Nothing to reveal for this account.</p>
              </section>
            )
          ) : null}

          {state.phase === PHASE.Ended && (
            <WinnerPanel account={account} state={state} onChanged={refresh} />
          )}
        </div>
      )}
    </main>
  );
}
