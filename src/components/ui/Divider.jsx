import React from "react";

export function Divider({ orientation = "horizontal", className = "" }) {
  if (orientation === "vertical") {
    return <div role="separator" aria-orientation="vertical" className={"w-px self-stretch bg-line-subtle " + className} />;
  }
  return <div role="separator" aria-orientation="horizontal" className={"h-px w-full bg-line-subtle " + className} />;
}
