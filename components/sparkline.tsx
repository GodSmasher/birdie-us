export function Sparkline({
  data,
  width = 80,
  height = 28,
  color = '#FACC15',
  fill = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && <polyline points={areaPoints} fill={color} opacity={0.12} stroke="none" />}
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChart24h({ data, color = '#FACC15' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((v, i) => {
        const h = max === 0 ? 0 : (v / max) * 100;
        const opacity = max === 0 ? 0.15 : 0.35 + (v / max) * 0.65;
        return (
          <div key={i} className="flex-1 flex flex-col items-stretch justify-end gap-1">
            <div
              className="rounded-t-sm w-full"
              style={{
                height: `${Math.max(h, v > 0 ? 2 : 0)}%`,
                background: color,
                opacity: v > 0 ? opacity : 0.08,
                minHeight: v > 0 ? 2 : 4,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function HourAxis() {
  const hours = ['00', '04', '08', '12', '16', '20', '24'];
  return (
    <div className="flex justify-between text-[10px] text-fg4 mt-1">
      {hours.map((h) => (
        <span key={h}>{h}</span>
      ))}
    </div>
  );
}
