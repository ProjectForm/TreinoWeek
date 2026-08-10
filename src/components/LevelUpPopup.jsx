import React, { useEffect, useState } from "react";

// Toast simples que aparece por alguns segundos quando o nível geral sobe
// dentro da mesma fase (sem trocar de patente — isso é a AscensaoModal).
export function LevelUpPopup({ nivel }) {
  const [prevNivel, setPrevNivel] = useState(nivel);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (nivel > prevNivel) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3500);
      setPrevNivel(nivel);
      return () => clearTimeout(t);
    }
    setPrevNivel(nivel);
  }, [nivel]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg z-50">
      Subiu para o nível {nivel}!
    </div>
  );
}
