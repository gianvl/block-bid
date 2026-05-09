// localStorage-backed memory of (bid, secret) pairs so a bidder can
// reveal later without retyping. Keyed by contract + bidder address so
// redeploying the contract starts a fresh slate.

const PREFIX = "blockbid";

function key(contract, account) {
  return `${PREFIX}:${contract.toLowerCase()}:${account.toLowerCase()}`;
}

export function saveBid(contract, account, { amountWei, secret }) {
  localStorage.setItem(
    key(contract, account),
    JSON.stringify({ amountWei: amountWei.toString(), secret }),
  );
}

export function loadBid(contract, account) {
  const raw = localStorage.getItem(key(contract, account));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
