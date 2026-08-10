import React from "react";
import { NotificationManager } from "./NotificationManager.jsx";

export function ProfileView({ workout }) {
  const {
    bodyStats, setBodyStats, saveProfile, profileMsg,
    exportText, doExport, importInput, setImportInput, importMsg, doImport,
  } = workout;

  return (
    <div className="px-4 pt-4">
      <p className="text-sm text-zinc-400 mb-3">
        Esses dados são usados para estimar seu gasto calórico. Atualize quando quiser — o app usa o valor mais recente salvo aqui.
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-zinc-500">Peso (kg)</label>
          <input
            type="number"
            value={bodyStats.weight}
            onChange={(e) => setBodyStats((prev) => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Altura (cm)</label>
          <input
            type="number"
            value={bodyStats.height}
            onChange={(e) => setBodyStats((prev) => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
            className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Idade</label>
          <input
            type="number"
            value={bodyStats.age}
            onChange={(e) => setBodyStats((prev) => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
            className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Segundos por série (média, com descanso)</label>
          <input
            type="number"
            value={bodyStats.secPerSet}
            onChange={(e) => setBodyStats((prev) => ({ ...prev, secPerSet: parseFloat(e.target.value) || 0 }))}
            className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
          />
          <p className="text-xs text-zinc-600 mt-1">Usado para estimar a duração do treino e calcular calorias.</p>
        </div>
      </div>
      <button onClick={saveProfile} className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl mt-4">
        Salvar perfil
      </button>
      {profileMsg === "ok" && <p className="text-center text-sm text-teal-400 mt-2">Perfil salvo.</p>}
      {profileMsg === "erro" && <p className="text-center text-sm text-rose-400 mt-2">Não deu para salvar.</p>}

      <NotificationManager />

      <div className="mt-6 pt-4 border-t border-zinc-800">
        <p className="text-sm font-semibold text-zinc-200 mb-2">Backup e restauração</p>
        <p className="text-xs text-zinc-500 mb-3">
          Exporte para guardar uma cópia de tudo (treinos, histórico, semanas e configurações). Importar mescla com o que já está salvo — registros mais recentes vencem.
        </p>
        <button onClick={doExport} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm py-3 rounded-xl">
          Exportar todos os dados
        </button>
        {exportText && (
          <div className="mt-2">
            <p className="text-xs text-zinc-500 mb-1">Copie e guarde este texto:</p>
            <textarea readOnly value={exportText} className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-400" />
          </div>
        )}

        <p className="text-xs text-zinc-500 mt-4 mb-1">Colar dados para importar:</p>
        <textarea
          value={importInput}
          onChange={(e) => setImportInput(e.target.value)}
          placeholder="Cole aqui o texto exportado anteriormente"
          className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 outline-none"
        />
        <button onClick={doImport} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm py-3 rounded-xl mt-2">
          Importar dados
        </button>
        {importMsg === "ok" && <p className="text-center text-sm text-teal-400 mt-2">Dados importados. Reabra o app para ver tudo atualizado.</p>}
        {importMsg === "erro" && <p className="text-center text-sm text-rose-400 mt-2">Não consegui importar — verifique se o texto colado está completo.</p>}
      </div>
    </div>
  );
}
