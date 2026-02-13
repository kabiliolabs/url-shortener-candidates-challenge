interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

/**
 * StatsCard - Reusable card for displaying statistics
 * 
 * Simple card component with consistent styling for displaying
 * metrics like counts, totals, and averages.
 */
export function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
