"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setOk(true);
        setTimeout(() => setOk(false), 900);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
      title="Copy"
    >
      <Copy size={14} />
      {ok ? "Copied" : "Copy"}
    </button>
  );
}
