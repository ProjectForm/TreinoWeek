import React, { useState } from "react";
import { usePlan } from "./hooks/usePlan.js";
import { useWorkoutData } from "./hooks/useWorkoutData.js";
import { useGamification } from "./hooks/useGamification.js";
import { NavBar } from "./components/NavBar.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import { WorkoutForm } from "./components/WorkoutForm.jsx";
import { ProgressView } from "./components/ProgressView.jsx";
import { HistoryView } from "./components/HistoryView.jsx";
import { CharacterView } from "./components/CharacterView.jsx";
import { ProfileView } from "./components/ProfileView.jsx";
import { PostWorkoutSummary } from "./components/PostWorkoutSummary.jsx";
import { AscensaoModal } from "./components/AscensaoModal.jsx";
import { LevelUpPopup } from "./components/LevelUpPopup.jsx";

export default function App() {
  const [view, setView] = useState("dashboard");

  const { plan, planReady } = usePlan();
  const workout = useWorkoutData(plan, planReady);
  const gamification = useGamification(workout.logs, workout.weeks, workout.ready);

  if (!workout.ready) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">
        <p className="text-sm">Carregando seus registros...</p>
      </div>
    );
  }

  if (workout.showSummary && workout.summaryData) {
    return (
      <PostWorkoutSummary
        dayData={workout.summaryData.dayData}
        previousSameDay={workout.summaryData.previousSameDay}
        rpg={workout.summaryData.rpg}
        onContinue={() => workout.setShowSummary(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      <LevelUpPopup event={gamification.levelUpEvent} onClose={gamification.clearLevelUpEvent} />

      {gamification.showAscensao && gamification.engineResult.historicoAscensoes.length > 0 && (
        <AscensaoModal
          historico={gamification.engineResult.historicoAscensoes}
          onContinue={gamification.acknowledgeAscensao}
        />
      )}

      <header className="px-4 pt-5 pb-3 border-b divider">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
          Treino <span className="text-rose-400">da Semana</span>
        </h1>
      </header>

      <NavBar view={view} setView={setView} />

      {view === "dashboard" && (
        <Dashboard
          engineResult={gamification.engineResult}
          plan={plan}
          logs={workout.logs}
          weeks={workout.weeks}
          date={workout.date}
          bodyStats={workout.bodyStats}
          onStartWorkout={() => setView("treino")}
          onViewChange={setView}
        />
      )}
      {view === "treino" && <WorkoutForm plan={plan} workout={workout} />}
      {view === "progresso" && (
        <ProgressView
          logs={workout.logs}
          exerciseHistory={workout.exerciseHistory}
          engineResult={gamification.engineResult}
          onStartWorkout={() => setView("treino")}
        />
      )}
      {view === "historico" && (
        <HistoryView plan={plan} allSessions={workout.allSessions} onStartWorkout={() => setView("treino")} />
      )}
      {view === "personagem" && (
        <CharacterView plan={plan} logs={workout.logs} weeks={workout.weeks} date={workout.date} gamification={gamification} />
      )}
      {view === "perfil" && <ProfileView workout={workout} />}
    </div>
  );
}
