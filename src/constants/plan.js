export const DEFAULT_PLAN = {
  seg: {
    label: "Seg", full: "Segunda", muscle: "Peito, Tríceps e Ombro",
    items: [
      { id: "supino_maquina", sets: 3, reps: "10" },
      { id: "supino_inclinado", sets: 3, reps: "10" },
      { id: "peck_deck", sets: 3, reps: "12" },
      { id: "triceps_corda", sets: 3, reps: "12" },
      { id: "triceps_coice", sets: 3, reps: "12" },
      { id: "elevacao_lateral", sets: 3, reps: "12", unilateral: true },
      { id: "face_pull", sets: 3, reps: "15" },
    ],
  },
  ter: {
    label: "Ter", full: "Terça", muscle: "Perna",
    items: [
      { id: "leg_press", sets: 3, reps: "12" },
      { id: "extensora", sets: 3, reps: "12" },
      { id: "flexora", sets: 3, reps: "12" },
      { id: "romana", sets: 3, reps: "12" },
      { id: "panturrilha", sets: 3, reps: "15" },
    ],
  },
  qua: {
    label: "Qua", full: "Quarta", muscle: "Costa e Bíceps",
    items: [
      { id: "puxada", sets: 3, reps: "10" },
      { id: "remada_maquina", sets: 3, reps: "10" },
      { id: "remada_unilateral", sets: 3, reps: "10", unilateral: true },
      { id: "rosca_direta", sets: 3, reps: "10" },
      { id: "rosca_concentrada", sets: 3, reps: "12", unilateral: true },
    ],
  },
  qui: { label: "Qui", full: "Quinta", muscle: "Descanso", items: [] },
  sex: {
    label: "Sex", full: "Sexta", muscle: "Full upper",
    items: [
      { id: "supino_maquina", sets: 3, reps: "10" },
      { id: "peck_deck", sets: 3, reps: "12" },
      { id: "puxada", sets: 3, reps: "10" },
      { id: "remada_maquina", sets: 3, reps: "10" },
      { id: "elevacao_lateral", sets: 3, reps: "12", unilateral: true },
      { id: "romana", sets: 3, reps: "12" },
      { id: "rosca_direta", sets: 3, reps: "10" },
      { id: "triceps_corda", sets: 3, reps: "12" },
    ],
  },
  sab: {
    label: "Sáb", full: "Sábado", muscle: "Perna (variação)",
    items: [
      { id: "leg_press", sets: 3, reps: "12" },
      { id: "extensora", sets: 3, reps: "10" },
      { id: "flexora", sets: 3, reps: "10" },
      { id: "romana", sets: 3, reps: "12" },
      { id: "panturrilha", sets: 3, reps: "15" },
    ],
  },
};

export const DAYS = ["seg", "ter", "qua", "qui", "sex", "sab"];

export const WEEKDAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export const NAV = [
  ["dashboard", "🏠", "Início"],
  ["treino", "💪", "Treino"],
  ["progresso", "📊", "Progresso"],
  ["historico", "🕘", "Histórico"],
  ["personagem", "🧙", "Personagem"],
  ["perfil", "⚙️", "Perfil"],
];
