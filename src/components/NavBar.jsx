import React from "react";
import { NAV } from "../constants/plan.js";
import { Icon } from "./Icon.jsx";

export function NavBar({ view, setView }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-nav bg-canvas/95 backdrop-blur-[var(--blur-md)] border-t border-line-subtle flex"
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
            className="relative flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 py-3 active:opacity-60 transition-opacity duration-standard"
          >
            <span
              className={
                "absolute top-0 h-0.5 rounded-full bg-primary-400 transition-all duration-standard " +
                (active ? "w-6 opacity-100" : "w-0 opacity-0")
              }
            />
            <Icon
              name={iconName}
              size={22}
              strokeWidth={active ? 2 : 1.7}
              className={active ? "text-primary-400" : "text-ink-tertiary"}
            />
            <span className={"text-[11px] " + (active ? "text-ink-primary font-semibold" : "text-ink-tertiary font-medium")}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
