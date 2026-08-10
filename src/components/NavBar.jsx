import React from "react";
import { NAV } from "../constants/plan.js";

export function NavBar({ view, setView }) {
  return (
    <header className="border-b border-zinc-800 px-4 pt-5 pb-3">
      <h1 className="text-xl font-bold tracking-wide text-rose-400">TREINO DA SEMANA</h1>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {NAV.map((v) => (
          <button
            key={v[0]}
            onClick={() => setView(v[0])}
            className={
              "px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap " +
              (view === v[0] ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")
            }
          >
            {v[1]}
          </button>
        ))}
      </div>
    </header>
  );
}
