import { ACCOUNTS } from "../lib/accounts.js";

export default function AccountPicker({ value, onChange }) {
  return (
    <label className="account-picker">
      <span>Acting as</span>
      <select
        value={value.address}
        onChange={(e) => {
          const next = ACCOUNTS.find((a) => a.address === e.target.value);
          if (next) onChange(next);
        }}
      >
        {ACCOUNTS.map((a) => (
          <option key={a.address} value={a.address}>
            {a.label}
          </option>
        ))}
      </select>
    </label>
  );
}
