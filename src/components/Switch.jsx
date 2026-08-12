import React from "react";

// Switch estilo iOS. Estado é sempre controlado pelo pai — este componente
// não guarda nada, então não há preferência persistida por trás dele.
export function Switch({ checked, onChange, label }) {
  function toggle() {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) { /* haptics não suportado neste dispositivo */ }
    }
    onChange(!checked);
  }

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={toggle}
      className={
        "relative shrink-0 w-11 h-7 rounded-full transition-colors duration-200 " +
        (checked ? "bg-rose-500" : "bg-zinc-700")
      }
    >
      <span
        className={
          "absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 " +
          (checked ? "translate-x-4" : "translate-x-0")
        }
      />
    </button>
  );
}
