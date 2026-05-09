import { ACCOUNTS } from "../lib/accounts.js";

export default function AccountPicker({ value, onChange }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 backdrop-blur">
      {ACCOUNTS.map((a) => {
        const active = value.address === a.address;
        return (
          <button
            key={a.address}
            type="button"
            onClick={() => onChange(a)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
              (active
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100")
            }
          >
            {a.short}
          </button>
        );
      })}
    </div>
  );
}
