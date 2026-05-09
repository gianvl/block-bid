import { PHASE_NAME } from "../lib/auction.js";

export default function PhaseBadge({ phase }) {
  return <span className={`phase phase-${phase}`}>{PHASE_NAME[phase]}</span>;
}
