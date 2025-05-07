
import { formatScorePercent } from "@/services/scoreService";
import { Score } from "@/types/offer";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: Score;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ScoreBadge = ({ score, size = 'md', showLabel = true, className }: ScoreBadgeProps) => {
  const scoreColorMap = {
    high: "bg-score-high",
    medium: "bg-score-medium",
    low: "bg-score-low"
  };
  
  const sizeMap = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-base",
    lg: "h-24 w-24 text-xl"
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white",
        sizeMap[size],
        scoreColorMap[score.result]
      )}>
        {formatScorePercent(score.value)}
      </div>
      {showLabel && (
        <span className={cn(
          "mt-2 font-medium",
          size === 'sm' ? "text-xs" : "text-sm",
          `text-score-${score.result}`
        )}>
          {score.label}
        </span>
      )}
    </div>
  );
};

export default ScoreBadge;
