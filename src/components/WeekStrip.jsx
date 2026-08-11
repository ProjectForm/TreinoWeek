import React from "react";
import { DAYS } from "../constants/plan.js";
import { getWeekDates, toISO, todayISO } from "../utils/dates.js";
import { Icon } from "./Icon.jsx";

// Faixa semanal onde data e dia-da-semana são sempre a mesma coisa — cada
// célula já é uma data real (seg..sáb da semana corrente), então não existe
// como selecionar um dia que não bate com a data. Usado tanto no Treino
// (seleção, escreve em `date`) quanto no Dashboard (somente leitura).
export function WeekStrip({ date, plan, logs, onSelectDate, readOnly = false }) {
  const weekDates = getWeekDates(date).slice(0, 6);
  const today = todayISO();

  function shiftWeek(delta) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + delta * 7);
    onSelectDate(toISO(d));
  }

  return (
    <div className="flex items-center gap-1">
      {!readOnly && (
        <button
          onClick={() => shiftWeek(-1)}
          aria-label="Semana anterior"
          className="press shrink-0 w-7 h-11 flex items-center justify-center text-zinc-500"
        >
          <Icon name="chevronLeft" size={17} />
        </button>
      )}
      <div className="flex-1 grid grid-cols-6 gap-1">
        {DAYS.map((k, i) => {
          const iso = weekDates[i];
          const planDia = plan[k];
          const temTreino = planDia && planDia.items && planDia.items.length > 0;
          const completo = logs && logs[iso] && logs[iso].status === "completed";
          const selected = iso === date;
          const isToday = iso === today;
          const CellTag = readOnly ? "div" : "button";
          return (
            <CellTag
              key={k}
              onClick={readOnly ? undefined : () => onSelectDate(iso)}
              aria-current={selected ? "date" : undefined}
              className={
                "press flex flex-col items-center justify-center gap-1 rounded-xl py-2 " +
                (selected ? "bg-rose-500 text-white" : temTreino ? "surface-2 text-zinc-300" : "surface-2 text-zinc-500")
              }
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                {planDia ? planDia.label : k}
              </span>
              <span className="text-sm font-bold leading-none">{parseInt(iso.slice(8, 10), 10)}</span>
              <span
                className={
                  "w-1.5 h-1.5 rounded-full " +
                  (completo ? (selected ? "bg-white" : "bg-teal-400") : isToday ? (selected ? "bg-white/70" : "bg-rose-400") : "bg-transparent")
                }
              />
            </CellTag>
          );
        })}
      </div>
      {!readOnly && (
        <button
          onClick={() => shiftWeek(1)}
          aria-label="Próxima semana"
          className="press shrink-0 w-7 h-11 flex items-center justify-center text-zinc-500"
        >
          <Icon name="chevronRight" size={17} />
        </button>
      )}
    </div>
  );
}
