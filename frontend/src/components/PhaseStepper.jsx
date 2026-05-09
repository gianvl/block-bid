import { PHASE } from "../lib/auction.js";

const STEPS = [
  { phase: PHASE.Commit, label: "Commit", hint: "Sealed bids submitted" },
  { phase: PHASE.Reveal, label: "Reveal", hint: "Bids opened & verified" },
  { phase: PHASE.Ended, label: "Settle", hint: "Winner & refunds" },
];

export default function PhaseStepper({ phase }) {
  return (
    <ol className="flex items-center justify-between gap-4">
      {STEPS.map((step, idx) => {
        const done = phase > step.phase;
        const current = phase === step.phase;
        return (
          <li key={step.phase} className="flex flex-1 items-center gap-3">
            <div className="flex flex-col items-center text-center">
              <div
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition " +
                  (current
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                    : done
                      ? "border-emerald-600/60 bg-emerald-600/15 text-emerald-400"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500")
                }
              >
                {done ? "✓" : idx + 1}
              </div>
              <p
                className={
                  "mt-1.5 text-[11px] font-semibold uppercase tracking-wider " +
                  (current
                    ? "text-indigo-300"
                    : done
                      ? "text-emerald-400"
                      : "text-zinc-500")
                }
              >
                {step.label}
              </p>
              <p className="text-[10px] text-zinc-600">{step.hint}</p>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={
                  "h-px flex-1 transition " +
                  (done ? "bg-emerald-600/40" : "bg-zinc-800")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
