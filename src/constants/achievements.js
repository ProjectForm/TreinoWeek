export const ACHIEVEMENT_DEFS = [
  { id: "primeiro_passo", nome: "Primeiro Passo", categoria: "Consistência", desc: "Registre seu 1º treino", check: (r) => r.totalTreinosCompletos >= 1 },
  { id: "semana_perfeita_1", nome: "Semana Perfeita", categoria: "Consistência", desc: "Complete sua 1ª semana perfeita", check: (r) => r.semanasPerfeitasTotal >= 1 },
  { id: "imparavel_12", nome: "Imparável", categoria: "Consistência", desc: "Alcance streak de 12 semanas", check: (r) => r.streakMaxima >= 12 },
  { id: "centuriao", nome: "Centurião", categoria: "Consistência", desc: "100 treinos registrados", check: (r) => r.totalTreinosCompletos >= 100 },
  { id: "recordista", nome: "Recordista", categoria: "Força", desc: "Bata seu 1º PR", check: (r) => r.totalPRs >= 1 },
  { id: "ferro_100kg", nome: "Ferro", categoria: "Força", desc: "100kg em qualquer exercício", check: (r) => r.maxCargaGeral >= 100 },
  { id: "maquina_500kg", nome: "Máquina", categoria: "Força", desc: "500kg de volume em uma sessão", check: (r) => r.volumeRecordeSessao >= 500 },
  { id: "equilibrio", nome: "Equilíbrio", categoria: "Evolução", desc: "Todos os grupos musculares no nível 30+", check: (r) => Object.values(r.musculos).every((m) => m.nivel >= 30) },
  { id: "primeira_ascensao", nome: "Primeira Ascensão", categoria: "Ascensão", desc: "Alcance sua 1ª ascensão", check: (r) => r.ascensaoCount >= 1 },
  { id: "veterano", nome: "Veterano", categoria: "Ascensão", desc: "3 ascensões", check: (r) => r.ascensaoCount >= 3 },
  { id: "lendario_15", nome: "Lendário", categoria: "Ascensão", desc: "15 ascensões", check: (r) => r.ascensaoCount >= 15 },
  { id: "escudo_bronze", nome: "Escudo de Bronze", categoria: "Streak", desc: "Conquiste seu 1º escudo", check: (r) => r.escudosConquistadosTotal >= 1 },
  { id: "inquebravel_12", nome: "Inquebrável", categoria: "Streak", desc: "Streak de 12 semanas", check: (r) => r.streakMaxima >= 12 },
];

export const TITULO_DEFS = [
  { id: "disciplinado", nome: "Disciplinado", check: (r) => r.streakMaxima >= 4 },
  { id: "incansavel", nome: "Incansável", check: (r) => r.streakMaxima >= 12 },
  { id: "ferro", nome: "Ferro", check: (r) => r.maxCargaGeral >= 100 },
  { id: "atleta", nome: "Atleta", check: (r) => r.ascensaoCount >= 5 },
  { id: "veterano_t", nome: "Veterano", check: (r) => r.ascensaoCount >= 3 },
  { id: "recordista_t", nome: "Recordista", check: (r) => r.totalPRs >= 10 },
  { id: "maquina_t", nome: "Máquina", check: (r) => r.volumeVidaToda >= 10000 },
  { id: "imparavel_t", nome: "Imparável", check: (r) => r.streakMaxima >= 20 },
  { id: "ressurgido_t", nome: "Ressurgido", check: (r) => r.teveRessurgimento },
];
