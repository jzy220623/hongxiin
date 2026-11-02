import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Star, ArrowRight, Medal, X } from 'lucide-react';
import { getAchievements } from '../api';
import { formatDate } from '../utils/helpers';

const toAssetUrl = (value?: string) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};
const DEFAULT_COVER_IMAGE = '/images/logo2.png';
const resolveImageUrl = (value?: string) => toAssetUrl(value) || DEFAULT_COVER_IMAGE;

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
  image?: string;
  image_url?: string;
  project_detail?: string;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.38, 0, 0, 1] },
  }),
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.2, duration: 0.8, ease: [0.38, 0, 0, 1] },
  }),
};

const getAwardLevelLabel = (level: string): string => {
  switch (level) {
    case 'national':
      return '国家级';
    case 'provincial':
      return '省部级';
    case 'school':
      return '校级';
    default:
      return level || '其他';
  }
};

const statsData = [
  { value: '50+', label: '国家级奖项', icon: Trophy },
  { value: '100+', label: '省部级奖项', icon: Medal },
  { value: '500+', label: '社团成员', icon: Star },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAchievements({ page, pageSize });
      const data = res.data;
      setAchievements(data?.list || data?.data || data || []);
      setTotalPages(
        data?.totalPages || data?.total_page || Math.ceil((data?.total || 0) / pageSize) || 1
      );
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError('加载获奖成果失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* ===== Hero Section ===== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(230,168,23,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 mb-6"
          >
            <Trophy className="w-8 h-8 text-primary-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="section-title text-white mb-4"
          >
            获奖成果
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-brand-light max-w-xl mx-auto"
          >
            用实力说话，用荣誉证明
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="section-divider mt-6" />
          </motion.div>
        </div>
      </section>

      {/* ===== Stats Highlight Section ===== */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={statVariants}
                className="glass-light rounded-2xl p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 mb-5">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div
                  className="num-large text-white mb-2"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
                >
                  {stat.value}
                </div>
                <div className="text-brand-muted text-sm font-medium tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Achievements Grid Section ===== */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-14"
          >
            <div className="section-divider mb-6" />
            <h2 className="section-title text-white mb-3">全部成果</h2>
            <p className="text-brand-muted max-w-lg mx-auto">
              点击卡片查看项目详情
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-brand-card border border-white/5 p-6 space-y-4 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-border" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-brand-border rounded w-1/3" />
                      <div className="h-3 bg-brand-border rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-4 bg-brand-border rounded w-3/4" />
                  <div className="h-3 bg-brand-border rounded w-full" />
                  <div className="h-3 bg-brand-border rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-brand-muted mx-auto mb-4" />
              <p className="text-brand-muted text-lg">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-5 py-2.5 rounded-full bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
              >
                重试
              </button>
            </div>
          ) : achievements.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((item, index) => (
                  <motion.div
                    key={item.id}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUpVariant}
                    onClick={() => setSelectedAchievement(item)}
                    className="cursor-pointer"
                  >
                    <div className="glass-light rounded-2xl p-6 card-hover relative overflow-hidden group">
                      {/* Corner decoration */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/5 rounded-bl-full -mr-4 -mt-4" />

                      <div className="relative">
                        {/* Numbered badge + Award level */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="num-badge">
                            {String(index + 1 + (page - 1) * pageSize).padStart(2, '0')}
                          </span>
                          {item.award_level && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-xs font-medium">
                              <Award className="w-3 h-3" />
                              {getAwardLevelLabel(item.award_level)}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-brand-muted text-sm leading-relaxed mb-4 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Date */}
                        {item.award_date && (
                          <div className="text-brand-muted text-xs mb-4">
                            {formatDate(item.award_date)}
                          </div>
                        )}

                        {/* Image */}
                        <div className="rounded-xl overflow-hidden h-44">
                          <img
                            src={resolveImageUrl(item.image || item.image_url)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>

                        {/* View detail arrow on hover */}
                        <div className="mt-4 flex items-center gap-1 text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          查看详情
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination — simple prev/next */}
              {totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-white/10 text-brand-light hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    上一页
                  </button>

                  <span className="text-brand-muted text-sm">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-white/10 text-brand-light hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-brand-muted mx-auto mb-4" />
              <p className="text-brand-muted text-lg">暂无获奖成果</p>
              <p className="text-brand-muted text-sm mt-2">敬请期待更多精彩</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== Detail Modal ===== */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedAchievement(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.38, 0, 0, 1] }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-brand-darker border border-white/10 rounded-2xl shadow-2xl"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-brand-darker rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary-500" />
                  <h2 className="text-lg font-semibold text-white">
                    {selectedAchievement.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-5">
                {/* Image */}
                <div className="rounded-xl overflow-hidden h-56">
                  <img
                    src={resolveImageUrl(selectedAchievement.image || selectedAchievement.image_url)}
                    alt={selectedAchievement.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-brand-card border border-white/5">
                    <p className="text-xs text-brand-muted">竞赛名称</p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {selectedAchievement.competition || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-card border border-white/5">
                    <p className="text-xs text-brand-muted">获奖等级</p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {selectedAchievement.award_rank || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-card border border-white/5">
                    <p className="text-xs text-brand-muted">项目名称</p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {selectedAchievement.project_name || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-card border border-white/5">
                    <p className="text-xs text-brand-muted">获奖日期</p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      {selectedAchievement.award_date
                        ? formatDate(selectedAchievement.award_date)
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Team members */}
                {selectedAchievement.team_members && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary-500" /> 团队成员
                    </h4>
                    <p className="text-sm text-brand-light leading-relaxed">
                      {selectedAchievement.team_members}
                    </p>
                  </div>
                )}

                {/* Description */}
                {selectedAchievement.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Medal className="w-4 h-4 text-primary-500" /> 项目描述
                    </h4>
                    <p className="text-sm text-brand-light leading-relaxed whitespace-pre-wrap">
                      {selectedAchievement.description}
                    </p>
                  </div>
                )}

                {/* Project detail */}
                {selectedAchievement.project_detail && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary-500" /> 项目详情
                    </h4>
                    <p className="text-sm text-brand-light leading-relaxed whitespace-pre-wrap">
                      {selectedAchievement.project_detail}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}