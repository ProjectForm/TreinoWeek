import React from "react";
import { Surface } from "./Surface.jsx";

// Card padrão (§24): superfície nível 1, padding 16px, radius 16px.
// variant="featured": padding 20-24px, radius 20px — pra destaques pontuais,
// não pra empilhar cards dentro de cards (profundidade máxima recomendada:
// background → card → modal).
export function Card({ variant = "default", className = "", children, ...rest }) {
  const isFeatured = variant === "featured";
  return (
    <Surface
      level={1}
      radius={isFeatured ? "xl" : "lg"}
      className={(isFeatured ? "p-6" : "p-4") + " " + className}
      {...rest}
    >
      {children}
    </Surface>
  );
}
