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
          className="press shrink-0 w-7 h-11 flex items-center justify-center text-ink-tertiary"
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
          // §8: estado atual/selecionado usa tinta teal sutil (não preenchimento
          // sólido); dia completo mostra um ícone de check — a informação de
          // "concluído" nunca depende só da cor do indicador.
          const stateClass = selected
            ? "bg-primary-500/[0.14] border border-primary-500/40 text-ink-primary"
            : isToday
              ? "bg-surface-2 border border-primary-400/40 text-ink-secondary"
              : temTreino
                ? "bg-surface-2 border border-transparent text-ink-secondary"
                : "bg-surface-2 border border-transparent text-ink-tertiary";
          return (
            <CellTag
              key={k}
              onClick={readOnly ? undefined : () => onSelectDate(iso)}
              aria-current={selected ? "date" : undefined}
              className={"press min-h-12 flex flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] py-2 " + stateClass}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                {planDia ? planDia.label : k}
              </span>
              <span className="text-sm font-bold leading-none tabular-nums">{parseInt(iso.slice(8, 10), 10)}</span>
              {completo ? (
                <>
                  <Icon name="checkCircle" size={11} filled className="text-primary-400" />
                  <span className="sr-only">Treino concluído</span>
                </>
              ) : (
                <span className="w-[11px] h-[11px]" aria-hidden="true" />
              )}
            </CellTag>
          );
        })}
      </div>
      {!readOnly && (
        <button
          onClick={() => shiftWeek(1)}
          aria-label="Próxima semana"
          className="press shrink-0 w-7 h-11 flex items-center justify-center text-ink-tertiary"
        >
          <Icon name="chevronRight" size={17} />
        </button>
      )}
    </div>
  );
}
