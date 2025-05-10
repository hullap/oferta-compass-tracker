
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
  // Mapeamento de cores moderno usando gradiente
  const scoreColorMap = {
    high: "from-emerald-500 to-emerald-700 border-emerald-400 text-emerald-100",
    medium: "from-amber-500 to-amber-700 border-amber-400 text-amber-100",
    low: "from-red-500 to-red-700 border-red-400 text-red-100"
  };
  
  const scoreLabelColorMap = {
    high: "text-emerald-400",
    medium: "text-amber-400",
    low: "text-red-400"
  };
  
  const sizeMap = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-base",
    lg: "h-24 w-24 text-xl"
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn(
        "rounded-full flex items-center justify-center font-semibold shadow-lg border-2",
        "bg-gradient-to-br transition-all duration-300",
        `${sizeMap[size]}`,
        `${scoreColorMap[score.result]}`
      )}>
        {formatScorePercent(score.value)}
      </div>
      {showLabel && (
        <span className={cn(
          "mt-2 font-medium",
          size === 'sm' ? "text-xs" : "text-sm",
          scoreLabelColorMap[score.result]
        )}>
          {score.label}
        </span>
      )}
    </div>
  );
};

export default ScoreBadge;
