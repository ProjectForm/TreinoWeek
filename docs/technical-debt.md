# Dívida técnica

Itens identificados durante a Fase 1 (Fundação) e deliberadamente adiados — não corrigidos agora porque exigiriam mudanças maiores do que o escopo da fase permite ("mudanças pequenas e isoladas"; "preservar comportamento correto"), ou porque não são bugs, só limitações conhecidas.

## 1. Notificações são baseadas em `setTimeout`, não Push API

**Problema:** `useNotifications`/`notifications.js` agendam lembretes via `setTimeout` no próprio processo da página (`src/hooks/useNotifications.js`). Isso só dispara enquanto o app está aberto ou foi usado recentemente — não é um lembrete real em segundo plano.
**Impacto:** usuário pode não receber o lembrete de treino se o app estiver fechado há muito tempo; expectativa de "notificação push" não é atendida de verdade.
**Prioridade:** média — funcionalidade existe e funciona no caso comum (app usado com frequência), mas a limitação é real.
**Possível solução:** Push API + Service Worker com um endpoint de push (exige alguma peça de backend/serviço de push, o que esta fase explicitamente não deve introduzir).
**Motivo para adiar:** a Fase 1 proíbe explicitamente adicionar backend/infra nova; isso é uma mudança arquitetural de produto, não uma correção de fundação.

## 2. `react-hooks/set-state-in-effect` desligado como erro (rebaixado a warning)

**Problema:** `eslint-plugin-react-hooks` v7 adiciona uma regra nova que sinaliza como erro qualquer `setState` síncrono dentro de um `useEffect`. Isso pega 7 usos legítimos e pré-existentes no projeto — sincronizar estado local a partir de uma fonte externa (troca de data, resultado do engine de XP, permissão de notificação carregada de forma assíncrona):
  - `src/components/ProgressView.jsx:38`
  - `src/components/WorkoutForm.jsx:63` e `:88`
  - `src/hooks/useGamification.js:35`
  - `src/hooks/useNotifications.js:11`
  - `src/hooks/useWorkoutData.js:220`
**Impacto:** nenhum bug funcional — é um padrão React comum e correto (embora a doc do React recomende formas alternativas, como derivar estado direto do render quando possível). Só o lint fica mais permissivo nesses pontos.
**Prioridade:** baixa.
**Possível solução:** revisar cada um desses 7 efeitos individualmente, avaliando se pode virar estado derivado (`useMemo`) ou se realmente precisa de um efeito (ex.: o de `useWorkoutData.js:220` sincroniza o formulário quando `date`/`logs`/`plan` mudam — provavelmente sempre vai precisar de um efeito, já que envolve reconciliar entrada do usuário existente).
**Motivo para adiar:** corrigir "de verdade" significa reestruturar vários hooks/componentes — a refatoração grande que a Fase 1 pede pra evitar sem uma necessidade comprovada de bug. Regra rebaixada pra warning em `eslint.config.js`, com a justificativa documentada ali.

## 3. `react-hooks/exhaustive-deps` com 2 avisos não resolvidos

- `src/components/ProgressView.jsx:41` — falta `onPresetConsumed` nas deps do efeito.
- `src/hooks/useWorkoutData.js:167` — falta `plan`; `:223` — falta `day`.
**Impacto:** nenhum bug observado nos testes/checklist manual — mas adicionar essas dependências às cegas poderia mudar quando os efeitos disparam (risco de loop ou de disparo a mais/a menos).
**Prioridade:** baixa.
**Possível solução:** revisar cada efeito, decidir se a dependência faltante é segura de adicionar ou se precisa de `useCallback`/reestruturação no componente pai primeiro.
**Motivo para adiar:** mudar dependências de efeito é o tipo de alteração que pode alterar comportamento sutilmente — não deve ser feita "de passagem" numa fase de estabilização.

## 4. `import React from "react"` não removido em ~20 arquivos

**Problema:** todo componente `.jsx` importa `React` explicitamente, mas não usa o identificador diretamente (JSX runtime automático do Vite não precisa disso desde o React 17). ESLint sinaliza como "não usado"; a regra foi ajustada pra não sinalizar `React` especificamente (ver `eslint.config.js`), em vez de remover o import em ~20 arquivos.
**Impacto:** nenhum — é só um import morto, inofensivo, sem custo de bundle relevante (tree-shaken).
**Prioridade:** cosmética.
**Possível solução:** remover em um commit dedicado, só de limpeza, quando não competir com trabalho de maior prioridade.
**Motivo para adiar:** a Fase 1 pede explicitamente pra não fazer "mudança cosmética gigante só pra satisfazer o lint".

## 5. Sem testes automatizados de componentes React

**Problema:** a suíte de testes desta fase (Vitest) cobre só lógica de domínio pura (`src/utils`, `src/hooks/useStorage.js`). Não há `@testing-library/react` nem `jsdom` instalados, então hooks com estado (`useWorkoutData`, `useGamification`, `usePlan`) e componentes não têm teste automatizado — só validação manual via Chrome headless.
**Impacto:** regressões de UI/integração (ex.: um componente passando a prop errada pro hook) não são pegas pelo `npm test`, só pelo checklist manual.
**Prioridade:** média.
**Possível solução:** adicionar `@testing-library/react` + `jsdom` como devDependencies numa fase futura e escrever testes de integração pros hooks principais.
**Motivo para adiar:** adicionar uma nova biblioteca de teste teria expandido escopo desta fase (que já introduziu Vitest + ESLint); a lógica de maior risco matemático (XP, calorias, unilateral, datas) já está coberta como função pura, que é onde estavam os bugs reais encontrados.

## 6. `computePlayerStateEngine` recalcula o histórico inteiro a cada chamada

**Problema:** o motor de gamificação (`src/utils/xp.js`) não tem estado incremental — a cada render ele reprocessa todos os treinos e semanas já salvos, do primeiro ao mais recente.
**Impacto:** nenhum problema perceptível no volume de dados de um usuário único local (centenas de treinos, não milhões). Pode ficar perceptível depois de vários anos de uso contínuo.
**Prioridade:** baixa, especulativa.
**Possível solução:** memoização incremental (guardar o estado acumulado até a última semana processada, só reprocessar semanas novas) — otimização não trivial, arriscada de introduzir bug sutil de "estado desatualizado".
**Motivo para adiar:** otimização prematura; não há evidência de problema de performance real ainda.

## 7. `schemaVersion` cobre só o formato de export/import, não o storage local

**Problema:** o backup agora carrega `{schemaVersion, appVersion, exportedAt, data}` (`src/utils/backup.js`), mas os dados dentro de `data` (e os dados como ficam salvos no `localStorage` do dia a dia) continuam sem nenhuma marca de versão de schema.
**Impacto:** nenhum agora — só relevante no dia em que o formato de um `day:*`/`week:*` precisar mudar de verdade (ex.: renomear um campo).
**Prioridade:** baixa, preparatória.
**Possível solução:** se/quando o formato dos registros precisar mudar, usar o `schemaVersion` do backup como precedente e estender a mesma ideia pro storage local.
**Motivo para adiar:** o pedido desta fase foi explicitamente "não é uma migração de storage ainda" — só preparar terreno pro export/import.
