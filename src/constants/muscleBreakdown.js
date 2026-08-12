export const DEFAULT_MUSCLE_BREAKDOWN = {
  supino_maquina: [{ m: "Peito", p: 65 }, { m: "Tríceps", p: 20 }, { m: "Ombro", p: 15 }],
  supino_inclinado: [{ m: "Peito", p: 60 }, { m: "Ombro", p: 20 }, { m: "Tríceps", p: 20 }],
  peck_deck: [{ m: "Peito", p: 85 }, { m: "Ombro", p: 10 }, { m: "Estabilizadores", p: 5 }],
  triceps_corda: [{ m: "Tríceps", p: 90 }, { m: "Estabilizadores", p: 10 }],
  triceps_coice: [{ m: "Tríceps", p: 90 }, { m: "Ombro posterior", p: 10 }],
  elevacao_lateral: [{ m: "Ombro", p: 65 }, { m: "Ombro posterior", p: 20 }, { m: "Trapézio", p: 15 }],
  face_pull: [{ m: "Ombro posterior", p: 45 }, { m: "Trapézio", p: 35 }, { m: "Estabilizadores", p: 20 }],
  leg_press: [{ m: "Quadríceps", p: 60 }, { m: "Glúteo", p: 25 }, { m: "Isquiotibiais", p: 15 }],
  extensora: [{ m: "Quadríceps", p: 95 }, { m: "Estabilizadores", p: 5 }],
  flexora: [{ m: "Isquiotibiais", p: 90 }, { m: "Panturrilha", p: 10 }],
  romana: [{ m: "Abdômen", p: 60 }, { m: "Flexores de quadril", p: 40 }],
  panturrilha: [{ m: "Panturrilha", p: 100 }],
  puxada: [{ m: "Costa", p: 65 }, { m: "Bíceps", p: 20 }, { m: "Trapézio", p: 15 }],
  remada_maquina: [{ m: "Costa", p: 55 }, { m: "Trapézio", p: 20 }, { m: "Bíceps", p: 20 }, { m: "Ombro posterior", p: 5 }],
  remada_unilateral: [{ m: "Costa", p: 55 }, { m: "Trapézio", p: 20 }, { m: "Bíceps", p: 20 }, { m: "Estabilizadores", p: 5 }],
  rosca_direta: [{ m: "Bíceps", p: 90 }, { m: "Ombro", p: 10 }],
  rosca_concentrada: [{ m: "Bíceps", p: 95 }, { m: "Antebraço", p: 5 }],
};

export const MUSCLE_TO_GROUP = {
  "Peito": "Peitoral",
  "Tríceps": "Braços",
  "Bíceps": "Braços",
  "Antebraço": "Braços",
  "Ombro": "Ombros",
  "Ombro posterior": "Ombros",
  "Trapézio": "Costas",
  "Costa": "Costas",
  "Quadríceps": "Pernas",
  "Isquiotibiais": "Pernas",
  "Glúteo": "Pernas",
  "Panturrilha": "Pernas",
  "Perna": "Pernas",
  "Abdômen": "Core",
  "Flexores de quadril": "Core",
  "Estabilizadores": null,
  "Posterior de coxa": "Pernas",
};

export const GROUP_ORDER = ["Braços", "Peitoral", "Costas", "Pernas", "Core", "Ombros"];

// Mapa reverso (grupo -> sub-músculos), derivado do próprio MUSCLE_TO_GROUP —
// não é uma estrutura nova, só uma outra visão dos mesmos dados. Só inclui
// músculos que realmente aparecem em algum exercício (DEFAULT_MUSCLE_BREAKDOWN),
// pra não listar sub-grupos vazios que nenhum exercício do plano trabalha.
const USED_MUSCLES = new Set();
Object.values(DEFAULT_MUSCLE_BREAKDOWN).forEach((breakdown) => {
  breakdown.forEach(({ m }) => USED_MUSCLES.add(m));
});

export const GROUP_TO_MUSCLES = {};
GROUP_ORDER.forEach((g) => (GROUP_TO_MUSCLES[g] = []));
Object.entries(MUSCLE_TO_GROUP).forEach(([muscle, group]) => {
  if (group && GROUP_TO_MUSCLES[group] && USED_MUSCLES.has(muscle)) {
    GROUP_TO_MUSCLES[group].push(muscle);
  }
});
