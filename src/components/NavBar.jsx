import React from "react";
import { NAV } from "../constants/plan.js";

export function NavBar({ view, setView }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900 border-t border-zinc-800 flex">
      {NAV.map(([key, icon, label]) => (
        <button
          key={key}
          onClick={() => setView(key)}
          className={
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 active:scale-95 transition-transform " +
            (view === key ? "text-rose-400" : "text-zinc-500")
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className="text-[10px] font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  );
}
