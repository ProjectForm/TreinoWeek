import sys, os
sys.path.insert(0, '/home/claude/treino-pwa')
from extract import extract_decl, src

OUT = '/home/claude/treino-pwa/src'

def w(path, content):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content.rstrip() + "\n")
    print('escrito:', path, '(' + str(len(content)) + ' chars)')

def block(name):
    return "export " + extract_decl(name, src)

def blocks(*names):
    return "\n\n".join(block(n) for n in names)

# =============================================================================
# constants/
# =============================================================================
w('constants/exercises.js', blocks('DEFAULT_EXERCISES'))

w('constants/muscleBreakdown.js', blocks('DEFAULT_MUSCLE_BREAKDOWN', 'MUSCLE_TO_GROUP', 'GROUP_ORDER'))

w('constants/plan.js', blocks('DEFAULT_PLAN', 'DAYS', 'WEEKDAY_KEYS', 'NAV'))

w('constants/config.js', blocks('RPG_CONFIG', 'RANKS', 'CARDIO_MET', 'MET_MUSCULACAO', 'DEFAULT_BODY'))

w('constants/achievements.js', blocks('ACHIEVEMENT_DEFS', 'TITULO_DEFS'))

# =============================================================================
# utils/
# =============================================================================
dates_js = '''import { WEEKDAY_KEYS } from "../constants/plan.js";

''' + blocks('toISO', 'todayISO', 'weekdayFromISO', 'getWeekKey', 'getWeekDates', 'mondayFromWeekKey', 'getWeekDatesFromWeekKey', 'daysBetween')
w('utils/dates.js', dates_js)

formatters_js = '''import { daysBetween } from "./dates.js";

''' + blocks('formatBR', 'formatShort', 'agoLabel', 'formatWeight')
w('utils/formatters.js', formatters_js)

stats_js = '''import { CARDIO_MET, MET_MUSCULACAO, DEFAULT_BODY } from "../constants/config.js";

''' + blocks(
    'tonnageOf', 'statsOf', 'getBaseline', 'computeStatus', 'computeMeta', 'fallbackStatusAndMeta',
    'sanitizeWeight', 'sanitizeReps', 'sanitizeMinutes', 'computeMusculKcal', 'computeCardioKcal'
)
w('utils/stats.js', stats_js)

muscles_js = '''import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { tonnageOf } from "./stats.js";

''' + blocks('computeGroupVolumes')
w('utils/muscles.js', muscles_js)

xp_js = '''import { RPG_CONFIG, RANKS } from "../constants/config.js";
import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { ACHIEVEMENT_DEFS, TITULO_DEFS } from "../constants/achievements.js";
import { tonnageOf } from "./stats.js";
import { getWeekKey } from "./dates.js";

''' + blocks(
    'buildCumulative', 'levelFromCumXP', 'xpProgress', 'multiplicadorStreak',
    'xpConsistenciaSemana', 'xpDisciplinaSemana', 'resolveWeekStreak', 'fatorVolumeRpg',
    'computePerformanceXPRpg', 'computeCaloriasXPRpg', 'computeEvolucaoXPRpg',
    'rankForAscensao', 'MAIN_CUM', 'ATTR_CUM', 'computePlayerStateEngine'
)
w('utils/xp.js', xp_js)

week_js = '''import { getWeekDatesFromWeekKey, weekdayFromISO } from "./dates.js";
import { fallbackStatusAndMeta } from "./stats.js";

''' + blocks('computeWeekPayload', 'resolveStreak')
w('utils/week.js', week_js)

print('\\nBatch 1 completo (constants + utils).')

# =============================================================================
# components/ (pequenos, extraídos diretamente)
# =============================================================================
w('components/LineChart.jsx', blocks('LineChart'))

w('components/AscensaoModal.jsx', "import React from \"react\";\n\n" + block('AscensaoScreen').replace('function AscensaoScreen', 'function AscensaoModal'))

w('components/Avatar.jsx', "import React from \"react\";\n\n" + blocks('Avatar'))

w('components/DesafioEquilibrio.jsx', "import React from \"react\";\n\n" + blocks('DesafioEquilibrio'))

missao_js = '''import React from "react";
import { getWeekKey, weekdayFromISO } from "../utils/dates.js";

''' + block('MissaoAtiva')
w('components/MissaoAtiva.jsx', missao_js)

pws_js = '''import React from "react";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { formatWeight, formatBR } from "../utils/formatters.js";

''' + block('PostWorkoutSummary')
w('components/PostWorkoutSummary.jsx', pws_js)

print('\\nBatch 2 completo (componentes extraídos).')
