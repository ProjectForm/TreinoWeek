import React from "react";
import { NAV } from "../constants/plan.js";
import { Icon } from "./Icon.jsx";

export function NavBar({ view, setView }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur border-t border-zinc-900 flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV.map(([key, iconName, label]) => {
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 active:opacity-60 transition-opacity"
          >
            <span
              className={
                "absolute top-0 h-0.5 rounded-full bg-rose-400 transition-all duration-200 " +
                (active ? "w-6 opacity-100" : "w-0 opacity-0")
              }
            />
            <Icon
              name={iconName}
              size={21}
              strokeWidth={active ? 2 : 1.7}
              className={active ? "text-rose-400" : "text-zinc-500"}
            />
            <span className={"text-[10px] " + (active ? "text-zinc-100 font-semibold" : "text-zinc-500 font-medium")}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
