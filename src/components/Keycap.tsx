interface KeycapProps {
  label: string;
}

/** A BA II Plus-style key. The 2ND key is gold, like on the real calculator. */
export function Keycap({ label }: KeycapProps) {
  const isSecond = label === "2ND";
  return (
    <kbd
      className={`inline-flex min-w-[2.4rem] items-center justify-center rounded-md px-2 py-1 font-mono text-[0.72rem] font-semibold tracking-wide shadow-[inset_0_-2px_0_rgb(0_0_0/0.35)] ${
        isSecond ? "bg-key-2nd text-ink" : "bg-key text-white"
      }`}
    >
      {label}
    </kbd>
  );
}
