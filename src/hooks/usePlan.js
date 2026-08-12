import { useState, useEffect } from "react";
import { sGet, sSet } from "./useStorage.js";
import { DEFAULT_PLAN } from "../constants/plan.js";

export function usePlan() {
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [planReady, setPlanReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      let loadedPlan = DEFAULT_PLAN;
      const planRaw = await sGet("plan");
      if (planRaw) {
        try {
          loadedPlan = JSON.parse(planRaw);
        } catch (e) { /* plano corrompido: segue com o plano padrão */ }
      } else {
        await sSet("plan", JSON.stringify(DEFAULT_PLAN));
      }
      if (alive) {
        setPlan(loadedPlan);
        setPlanReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { plan, setPlan, planReady };
}
