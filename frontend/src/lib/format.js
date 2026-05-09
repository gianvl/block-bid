export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function shortAddress(addr) {
  if (!addr || addr === ZERO_ADDRESS) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function isZeroAddress(addr) {
  return !addr || addr.toLowerCase() === ZERO_ADDRESS;
}
