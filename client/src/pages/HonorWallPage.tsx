import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHonorWall } from '../api';
import {
  Award, GraduationCap, MapPin, Quote, X, Cpu, Zap, Users,
  ChevronDown, ChevronUp, Star, Briefcase, BookOpen, Heart
} from 'lucide-react';

// ==================== Types ====================

interface HonorMember {
  id: number;
  name: string;
  avatar: string;
  cohort: string;
  role: string;
  member_type: string;
  achievements: string;
  full_achievements: string[];
  projects: string[];
  message: string;
  destination: string;
  sort_order: number;
}

interface CohortGroup {
  cohort: string;
  members: HonorMember[];
}

// ==================== Component ====================

export default function HonorWallPage() {
  const [cohorts, setCohorts] = useState<CohortGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<HonorMember | null>(null);
  const [expandedCohorts, setExpandedCohorts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getHonorWall();
      const data = res.data || [];
      setCohorts(data);
      // Auto-expand all cohorts
      setExpandedCohorts(new Set(data.map((c: CohortGroup) => c.cohort)));
    } catch (err) {
      console.error('加载荣誉墙失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCohort = (cohort: string) => {
    setExpandedCohorts((prev) => {
      const next = new Set(prev);
      if (next.has(cohort)) next.delete(cohort);
      else next.add(cohort);
      return next;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'founder': return <Star className="w-4 h-4" />;
      case 'competition': return <Zap className="w-4 h-4" />;
      case 'tech': return <Cpu className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'founder': return '创始人';
      case 'competition': return '竞赛领军者';
      case 'tech': return '技术骨干';
      default: return '成员';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'founder': return 'from-amber-500 to-yellow-500';
      case 'competition': return 'from-blue-500 to-cyan-500';
      case 'tech': return 'from-emerald-500 to-teal-500';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'founder': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'competition': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'tech': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <Award className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-primary-400">历届突出成员</span>
            </div>
            <h1 className="section-title text-white mb-4">荣誉墙</h1>
            <p className="text-brand-light text-lg max-w-2xl mx-auto leading-relaxed">
              他们是智赛宏芯社的骄傲，用智慧和汗水在芯片设计领域留下了属于自己的印记。
              每一届都有一批优秀学子从这里出发，走向更广阔的舞台。
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            <div className="text-center">
              <div className="num-large text-primary-500">{cohorts.length}</div>
              <p className="text-brand-muted text-sm mt-1">届</p>
            </div>
            <div className="text-center">
              <div className="num-large text-primary-500">
                {cohorts.reduce((sum, c) => sum + c.members.length, 0)}
              </div>
              <p className="text-brand-muted text-sm mt-1">位突出成员</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="space-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 bg-white/5 rounded w-32 mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-48 bg-white/5 rounded-2xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-32">
              <Users className="w-16 h-16 text-brand-muted mx-auto mb-4" />
              <p className="text-brand-light text-lg">暂无荣誉墙数据</p>
              <p className="text-brand-muted text-sm mt-2">敬请期待</p>
            </div>
          ) : (
            /* Timeline */
            <div className="relative">
              {/* Central line */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500/30 via-primary-500/20 to-transparent" />

              <div className="space-y-16">
                {cohorts.map((group, groupIdx) => {
                  const isExpanded = expandedCohorts.has(group.cohort);
                  return (
                    <motion.div
                      key={group.cohort}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.6, delay: groupIdx * 0.1 }}
                    >
                      {/* Cohort Header */}
                      <div className="relative flex items-center gap-4 mb-8">
                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary-500 border-4 border-brand-dark shadow-lg shadow-primary-500/25 z-10" />
                        <div className="ml-10 md:ml-0 md:mx-auto flex items-center gap-4">
                          <button
                            onClick={() => toggleCohort(group.cohort)}
                            className="flex items-center gap-3 group"
                          >
                            <GraduationCap className="w-7 h-7 text-primary-500" />
                            <h2 className="text-3xl font-bold text-white group-hover:text-primary-400 transition-colors">
                              {group.cohort}届
                            </h2>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-brand-muted" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-brand-muted" />
                            )}
                          </button>
                          <span className="text-brand-muted text-sm">
                            {group.members.length}位突出成员
                          </span>
                        </div>
                      </div>

                      {/* Member Cards */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-8 md:ml-0">
                              {group.members.map((member, idx) => (
                                <motion.div
                                  key={member.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                                >
                                  <div
                                    onClick={() => setSelectedMember(member)}
                                    className="group relative bg-brand-darker border border-white/5 rounded-2xl p-6 hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-500 cursor-pointer"
                                  >
                                    {/* Top gradient bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${getTypeColor(member.member_type)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                      {/* Avatar */}
                                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTypeColor(member.member_type)} flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg`}>
                                        {member.avatar ? (
                                          <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-xl object-cover" />
                                        ) : (
                                          member.name.charAt(0)
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors truncate">
                                          {member.name}
                                        </h3>
                                        <p className="text-sm text-brand-light mt-0.5 line-clamp-2">{member.role}</p>
                                      </div>
                                    </div>

                                    {/* Type Badge */}
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${getTypeBg(member.member_type)}`}>
                                      {getTypeIcon(member.member_type)}
                                      {getTypeLabel(member.member_type)}
                                    </span>

                                    {/* Achievements */}
                                    <div className="mt-4 space-y-2">
                                      {member.achievements.split('|').slice(0, 2).map((ach, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                          <Award className="w-3.5 h-3.5 text-primary-500 mt-0.5 flex-shrink-0" />
                                          <span className="text-brand-light leading-relaxed line-clamp-1">{ach.trim()}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Hover hint */}
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                      <span className="text-xs text-brand-muted">{member.cohort}届</span>
                                      <span className="text-xs text-primary-500/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                        点击查看详情 →
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedMember(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl bg-brand-darker border border-white/10 rounded-2xl shadow-2xl overflow-hidden mb-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg text-brand-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className={`h-2 bg-gradient-to-r ${getTypeColor(selectedMember.member_type)}`} />
              <div className="px-8 pt-6 pb-4">
                <div className="flex items-center gap-5">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getTypeColor(selectedMember.member_type)} flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-xl`}>
                    {selectedMember.avatar ? (
                      <img src={selectedMember.avatar} alt={selectedMember.name} className="w-20 h-20 rounded-2xl object-cover" />
                    ) : (
                      selectedMember.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedMember.name}</h2>
                    <p className="text-brand-light mt-1">{selectedMember.role}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${getTypeBg(selectedMember.member_type)}`}>
                        {getTypeIcon(selectedMember.member_type)}
                        {getTypeLabel(selectedMember.member_type)}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-brand-muted">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {selectedMember.cohort}届
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Full Achievements */}
                {selectedMember.full_achievements && selectedMember.full_achievements.length > 0 && (
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <Award className="w-4 h-4 text-primary-500" />
                      获奖成就
                    </h3>
                    <div className="space-y-2.5">
                      {selectedMember.full_achievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                          <span className="text-sm text-brand-light">{ach}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {selectedMember.projects && selectedMember.projects.length > 0 && (
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <BookOpen className="w-4 h-4 text-primary-500" />
                      项目经历
                    </h3>
                    <div className="space-y-2.5">
                      {selectedMember.projects.map((proj, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span className="text-sm text-brand-light">{proj}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Message */}
                {selectedMember.message && (
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <Heart className="w-4 h-4 text-primary-500" />
                      个人寄语
                    </h3>
                    <div className="relative p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                      <Quote className="absolute top-2 left-2 w-5 h-5 text-primary-500/20" />
                      <p className="text-sm text-brand-light leading-relaxed pl-4 italic">
                        {selectedMember.message}
                      </p>
                    </div>
                  </section>
                )}

                {/* Destination */}
                {selectedMember.destination && (
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      毕业去向
                    </h3>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <Briefcase className="w-4 h-4 text-brand-muted" />
                      <span className="text-sm text-brand-light">{selectedMember.destination}</span>
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}