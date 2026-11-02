import { Trophy, Users, Calendar } from 'lucide-react';
import { formatDate, getAwardLevelColor, getAwardLevelLabel } from '../../utils/helpers';

interface AchievementItem {
  id: number;
  title: string;
  competition: string;
  award_level: string;
  award_rank: string;
  project_name: string;
  description: string;
  team_members: string;
  award_date: string;
}

interface AchievementCardProps {
  achievement: AchievementItem;
}

const rankColors: Record<string, string> = {
  '一等奖': 'text-yellow-500',
  '二等奖': 'text-slate-400',
  '三等奖': 'text-amber-600',
  '特等奖': 'text-red-500',
};

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const levelColor = getAwardLevelColor(achievement.award_level);
  const levelLabel = getAwardLevelLabel(achievement.award_level);
  const rankColor = rankColors[achievement.award_rank] || 'text-gray-500';

  return (
    <div
      className={`rounded-xl border-2 bg-white dark:bg-gray-900 p-5 transition-all duration-300 hover:shadow-lg ${levelColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{levelLabel}</span>
            <h4 className={`text-lg font-bold ${rankColor}`}>{achievement.award_rank}</h4>
          </div>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {achievement.competition}
        </span>
      </div>

      {/* Title & Project */}
      <h3 className="text-base font-semibold mb-1">{achievement.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        项目：{achievement.project_name}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
        {achievement.description}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span className="line-clamp-1">{achievement.team_members}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(achievement.award_date)}
        </div>
      </div>
    </div>
  );
}