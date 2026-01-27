import { useState } from 'react';
import type { AnalystGrade } from '../../types/fmp';

interface AnalystRatingsProps {
  grades: AnalystGrade[];
  loading: boolean;
}

export function AnalystRatings({ grades, loading }: AnalystRatingsProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedGrades = showAll ? grades : grades.slice(0, 5);

  // Determine if rating is positive, negative, or neutral
  const getRatingColor = (rating: string): string => {
    const lower = rating.toLowerCase();
    if (lower.includes('buy') || lower.includes('outperform') || lower.includes('overweight')) {
      return 'text-accent-green';
    }
    if (lower.includes('sell') || lower.includes('underperform') || lower.includes('underweight')) {
      return 'text-accent-red';
    }
    return 'text-text-primary';
  };

  // Format target price change (currently unused - kept for future use)
  // const formatTarget = (_grade: AnalystGrade): { text: string; color: string } => {
  //   // The API doesn't provide target prices in grades endpoint
  //   // This is a placeholder - you'd need a different endpoint for price targets
  //   return { text: '-', color: 'text-text-primary' };
  // };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="border-b border-border">
      {/* Header */}
      <div className="px-2 py-1 bg-bg-tertiary border-b border-border">
        <span className="text-text-primary text-xs font-semibold">ANALYST RATINGS</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-4 h-4 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        ) : grades.length === 0 ? (
          <div className="text-text-primary text-xs text-center py-2">
            No analyst ratings available
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-primary border-b border-border">
                <th className="text-left font-normal px-2 py-1">Firm</th>
                <th className="text-left font-normal px-2 py-1">Rating</th>
                <th className="text-left font-normal px-2 py-1">Change</th>
                <th className="text-left font-normal px-2 py-1">Date</th>
              </tr>
            </thead>
            <tbody>
              {displayedGrades.map((grade, index) => {
                return (
                  <tr
                    key={`${grade.gradingCompany}-${grade.date}-${index}`}
                    className="border-b border-border/50 hover:bg-bg-tertiary/50"
                  >
                    <td className="px-2 py-0.5 text-text-primary">{grade.gradingCompany}</td>
                    <td className={`px-2 py-0.5 ${getRatingColor(grade.newGrade)}`}>
                      {grade.newGrade}
                    </td>
                    <td className="px-2 py-0.5 text-text-secondary">
                      {grade.previousGrade !== grade.newGrade ? (
                        <span>{grade.previousGrade} → {grade.newGrade}</span>
                      ) : '-'}
                    </td>
                    <td className="px-2 py-0.5 text-text-primary font-mono">
                      {formatDate(grade.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Show All */}
      {grades.length > 5 && (
        <div className="px-2 py-1 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-text-primary text-xs hover:text-accent-blue"
          >
            {showAll ? 'less' : 'more'}
          </button>
        </div>
      )}
    </div>
  );
}
