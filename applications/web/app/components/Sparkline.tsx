interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  label?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  className = "",
  label = "Trend",
}: SparklineProps) {
  if (data.length === 0) {
    return (
      <svg width={width} height={height} className={className} role="img" aria-label={label} />
    );
  }

  if (data.length === 1) {
    return (
      <svg
        width={width}
        height={height}
        className={className}
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${height}`}
      >
        <circle cx={width / 2} cy={height / 2} r={2} fill="currentColor" />
      </svg>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
