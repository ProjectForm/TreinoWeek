import React from "react";
import { NotificationManager } from "./NotificationManager.jsx";
import { Icon } from "./Icon.jsx";

function Field({ label, value, onChange, suffix }) {
  return (
    <div>
      <label className="text-xs text-zinc-500">{label}</label>
      <div className="flex items-center gap-2 mt-1 surface-1 rounded-xl px-3">
        <input
          type="number"
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent py-3 text-sm text-zinc-100 outline-none"
        />
        {suffix && <span className="text-xs text-zinc-500">{suffix}</span>}
      </div>
    </div>
  );
}

export function ProfileView({ workout }) {
  const {
    bodyStats, setBodyStats, saveProfile, profileMsg,
    exportText, doExport, importInput, setImportInput, importMsg, doImport,
  } = workout;

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      <div>
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2 px-1">Dados corporais</p>
        <div className="surface-1 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-zinc-500 -mt-1">Usados só para estimar seu gasto calórico — nada é compartilhado.</p>
          <Field
            label="Peso"
            value={bodyStats.weight}
            suffix="kg"
            onChange={(e) => setBodyStats((prev) => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
          />
          <Field
            label="Altura"
            value={bodyStats.height}
            suffix="cm"
            onChange={(e) => setBodyStats((prev) => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
          />
          <Field
            label="Idade"
            value={bodyStats.age}
            suffix="anos"
            onChange={(e) => setBodyStats((prev) => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
          />
          <div>
            <Field
              label="Segundos por série (com descanso)"
              value={bodyStats.secPerSet}
              suffix="s"
              onChange={(e) => setBodyStats((prev) => ({ ...prev, secPerSet: parseFloat(e.target.value) || 0 }))}
            />
            <p className="text-[11px] text-zinc-500 mt-1">Usado para estimar a duração do treino e as calorias.</p>
          </div>
          <button onClick={saveProfile} className="press w-full bg-rose-500 text-white font-semibold py-3 rounded-xl">
            Salvar perfil
          </button>
          {profileMsg === "ok" && <p className="text-center text-sm text-teal-400">Perfil salvo.</p>}
          {profileMsg === "erro" && <p className="text-center text-sm text-rose-400">Não foi possível salvar.</p>}
        </div>
      </div>

      <NotificationManager />

      <div>
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2 px-1">Backup e dados</p>
        <div className="surface-1 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-zinc-500 -mt-1">
            Exporte para guardar uma cópia de tudo. Importar mescla com o que já está salvo — registros mais recentes vencem.
          </p>
          <button onClick={doExport} className="press w-full surface-2 text-zinc-200 text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2">
            <Icon name="download" size={16} className="text-zinc-400" />
            Exportar todos os dados
          </button>
          {exportText && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">Copie e guarde este texto:</p>
              <textarea readOnly value={exportText} className="w-full h-28 surface-2 rounded-xl p-3 text-xs text-zinc-400 outline-none" />
            </div>
          )}

          <div className="pt-1">
            <p className="text-xs text-zinc-500 mb-1.5">Colar dados para importar:</p>
            <textarea
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="Cole aqui o texto exportado anteriormente"
              className="w-full h-24 surface-2 rounded-xl p-3 text-xs text-zinc-300 outline-none"
            />
            <button onClick={doImport} className="press w-full surface-2 text-zinc-200 text-sm font-medium py-3 rounded-xl mt-2 flex items-center justify-center gap-2">
              <Icon name="upload" size={16} className="text-zinc-400" />
              Importar dados
            </button>
          </div>
          {importMsg === "ok" && <p className="text-center text-sm text-teal-400">Dados importados. Reabra o app para ver tudo atualizado.</p>}
          {importMsg === "erro" && <p className="text-center text-sm text-rose-400">Não consegui importar — verifique se o texto colado está completo.</p>}
        </div>
      </div>
    </div>
  );
}
