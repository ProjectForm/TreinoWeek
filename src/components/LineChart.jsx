export function LineChart({ points, color, unit }) {
  if (!points || points.length < 2) return null;
  const W = 320, H = 130, P = 26;
  const vals = points.map((p) => p.value);
  let min = Math.min.apply(null, vals);
  let max = Math.max.apply(null, vals);
  if (max === min) {
    max = max + 1;
    min = Math.max(0, min - 1);
  }
  const x = (i) => P + (i * (W - P * 2)) / (points.length - 1);
  const y = (v) => H - P - ((v - min) / (max - min)) * (H - P * 2);
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + x(i) + " " + y(p.value)).join(" ");
  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#3f3f46" strokeWidth="1" />
      <line x1={P} y1={P - 8} x2={P} y2={H - P} stroke="#3f3f46" strokeWidth="1" />
      <text x="2" y={y(max) + 4} fill="#71717a" fontSize="9">{Math.round(max)}</text>
      <text x="2" y={y(min) + 4} fill="#71717a" fontSize="9">{Math.round(min)}</text>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="3.5" fill={color} />
          <text x={x(i)} y={H - P + 13} fill="#71717a" fontSize="9" textAnchor="middle">{p.label}</text>
        </g>
      ))}
      <text x={W - P} y="12" fill="#52525b" fontSize="9" textAnchor="end">{unit}</text>
    </svg>
  );
}
