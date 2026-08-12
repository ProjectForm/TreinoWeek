# Treino da Semana

PWA de treino/academia com gamificação RPG (XP, nível, streak, escudos, ascensão, atributos). React + Vite, sem backend — tudo roda no navegador e persiste em `localStorage`.

## Rodando localmente

```bash
npm install
npm run dev        # servidor de desenvolvimento (Vite)
npm run build       # build de produção em dist/
npm run preview     # serve o build de dist/ localmente
```

## Testes e qualidade

```bash
npm test             # roda toda a suíte de testes uma vez (Vitest)
npm run test:watch   # modo watch, útil durante desenvolvimento
npm run test:coverage # roda os testes com relatório de cobertura
npm run lint          # ESLint (flat config, eslint.config.js)
```

O CI (`.github/workflows/ci.yml`) roda `lint` → `test` → `build` em toda PR e push para `main`, e falha o pipeline se qualquer etapa falhar.

Os testes cobrem a lógica de domínio pura em `src/utils/*.test.js` e `src/hooks/useStorage.test.js` — cálculo de XP/streak/escudo/PR, volume e calorias, semanas ISO, persistência e o formato de backup. Não há testes de componentes React (nenhuma lib de testing de DOM está instalada nesta fase — ver `docs/technical-debt.md`); a cobertura de UI é feita manualmente (checklist de regressão) e visualmente.

## Arquitetura

```
Componentes (src/components, App.jsx)
        │  props / callbacks
        ▼
Hooks (src/hooks)
  usePlan            — plano de treino (dias × exercícios), com plano padrão de fallback
  useWorkoutData      — dados de treino: dias, semanas, histórico por exercício, formulário do dia
                        atual, salvar/exportar/importar. O hook mais central do app.
  useGamification     — deriva todo o estado de personagem (XP, nível, streak, ...) a partir de
                        logs/weeks vindos de useWorkoutData; não guarda XP em lugar nenhum.
        │  chama funções puras
        ▼
Domínio / utils (src/utils)
  stats.js    — matemática de série/exercício: volume, carga máxima, calorias, sanitização
  xp.js       — motor de gamificação (computePlayerStateEngine) e as fórmulas de XP/streak/PR
  dates.js    — datas, dia da semana, semana ISO-8601 (semana ancorada na quinta-feira)
  week.js     — payload de semana (dias completos/parciais/pulados) e resolução de streak
  muscles.js  — volume por grupo muscular / sub-músculo, a partir das séries de um treino
  backup.js   — formato de export/import (schemaVersion + validação), sem depender de storage
        │  await sGet/sSet/sList/sDelete
        ▼
Storage (src/hooks/useStorage.js)
  wrapper async fino sobre localStorage (getItem/setItem/removeItem/key)
```

Os hooks são a única camada que toca `useStorage`; os `utils` são funções puras (dado → dado), sem I/O — é por isso que são a camada testada com testes automatizados nesta fase. Os componentes React não têm lógica de negócio própria: recebem dados e callbacks já prontos dos hooks.

## Modelo de persistência

Tudo fica em `localStorage`, sob estas chaves:

- `day:<ISO date>` — um treino completo daquele dia (exercícios, séries, cardio, cafeína, meta calculada)
- `week:<ISO week>` — payload da semana (dias planejados/completos/parciais/pulados, streak ao final da semana)
- `exerciseHistory` — histórico de carga máxima/volume por exercício, últimas 52 entradas
- `lastWorkoutByExercise` — atalho pro último registro de cada exercício
- `settings` — dados corporais usados na estimativa de calorias
- `plan` — o plano de treino (dias × exercícios), editável a partir do padrão
- `userCreatedAt`, `tituloAtivo`, `lastSeenAscensao` — metadados pequenos

Todo `JSON.parse` de dado carregado do storage é protegido por `try/catch` — um registro individual corrompido é ignorado (com o resto do histórico carregando normalmente), nunca trava o carregamento do app inteiro.

**Nada de XP/nível/streak é persistido diretamente.** `computePlayerStateEngine(logs, weeks)` (em `xp.js`) recalcula o estado de personagem inteiro a partir dos logs e semanas salvos, toda vez que é chamado. Isso significa que o estado de personagem nunca pode ficar "dessincronizado" do histórico real de treinos — mas também significa que o cálculo é O(total de treinos já feitos) a cada render (aceitável no volume de dados de um único usuário local; ver `docs/technical-debt.md` se isso crescer).

### Backup (export/import)

O export gera `{ schemaVersion, appVersion, exportedAt, data }` (`src/utils/backup.js`), onde `data` é o mesmo mapa chave→valor de sempre. O import aceita tanto esse formato novo quanto um backup antigo (mapa cru, sem wrapper, exportado antes desta mudança). Cada chave é importada individualmente — uma entrada corrompida ou malformada é pulada sem abortar o restante do import nem corromper o que já estava salvo.

## Conceitos de domínio

**Volume vs. carga (peso máximo/PR)** — para exercícios unilaterais (guardados como `{weight, weightD, reps}`, onde `weight`=E e `weightD`=D), existem duas unidades distintas e é fácil confundir uma pela outra:

- `effectiveWeight(s)` = `E + D` — unidade de **volume** (`volume = (E+D) × reps`). Uma série de 10kg em cada lado tem volume equivalente a uma série bilateral de 20kg.
- `maxSideWeight(s)` = `max(E, D)` — unidade de **carga** (PR, "carga máxima", fator de intensidade no XP de performance). A mesma série de 10kg+10kg representa uma carga de 10kg por lado, **não** um PR de 20kg.

Misturar as duas (usar `effectiveWeight` onde a carga máxima era esperada) foi um bug corrigido nesta fase — ver `git log` / `docs/technical-debt.md` para o histórico. Qualquer código novo que precise de "quanto peso essa série moveu" deve escolher explicitamente uma das duas funções, nunca assumir que "peso" tem uma unidade só.

`isSetPerformed(s)` = `effectiveWeight(s) > 0` — o predicado canônico de "essa série foi de fato realizada" (peso preenchido), usado para diferenciar séries preenchidas de linhas vazias do formulário nunca usadas.

**XP e nível** — `computePlayerStateEngine` (em `xp.js`) processa os logs em ordem cronológica, sessão por sessão e semana por semana, acumulando XP em atributos (força, condicionamento, disciplina, consistência) e por grupo muscular, aplicando o motor de streak/escudo/ascensão semana a semana. O XP total dentro de uma "fase" (entre ascensões) vira nível via uma curva exponencial (`buildCumulative`); ao bater o topo da curva (nível 100), o personagem "ascende": o nível volta a 0, mas atributos, grupos musculares e um bônus permanente de XP (+5% por ascensão, até 50%) são preservados.

## Limitações conhecidas

- O cálculo de calorias é uma estimativa simples baseada em MET × peso × tempo (segundos por série configuráveis), não um valor medido.
- Descanso entre séries é um valor fixo sugerido (`DEFAULT_REST_SECONDS`), não configurável por exercício.
- Não há testes automatizados de componentes React nesta fase (só de lógica de domínio) — cobertura de UI depende de checklist manual.
- Ver `docs/technical-debt.md` para a lista completa de débitos técnicos identificados e deliberadamente adiados.
