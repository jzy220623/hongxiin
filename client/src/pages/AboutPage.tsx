import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Users,
  Trophy,
  BookOpen,
  Microscope,
  GraduationCap,
  Zap,
  Shield,
  Target,
  Star,
} from 'lucide-react';
import { getClubInfo, getMembers, getTimeline } from '../api';
import { formatDate } from '../utils/helpers';

const toAssetUrl = (value?: string) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};
const DEFAULT_COVER_IMAGE = '/images/logo2.png';

// ── Types ────────────────────────────────────────────────────────────

interface ClubInfoData {
  description?: string;
  history?: string;
  culture?: string;
  established?: string;
  slogan?: string;
  cover_image?: string;
}

interface MemberItem {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  bio: string;
  sort_order?: number;
}

interface TimelineItem {
  id?: number;
  year: string;
  title: string;
  description: string;
}

// ── Data ─────────────────────────────────────────────────────────────

const features = [
  { icon: Cpu, label: '芯片设计', color: '#e6a817' },
  { icon: Microscope, label: '集成电路', color: '#e6a817' },
  { icon: Zap, label: '嵌入式系统', color: '#e6a817' },
  { icon: Trophy, label: '科创竞赛', color: '#e6a817' },
  { icon: BookOpen, label: '技术分享', color: '#cc3333' },
  { icon: GraduationCap, label: '人才培养', color: '#cc3333' },
  { icon: Shield, label: '项目实战', color: '#e6a817' },
  { icon: Target, label: '产学研合作', color: '#cc3333' },
];

// ── Animation Variants ───────────────────────────────────────────────

const fadeUpVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.7,
      ease: [0.38, 0, 0, 1],
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.38, 0, 0, 1] },
  },
};

// ── Component ────────────────────────────────────────────────────────

export default function AboutPage() {
  const location = useLocation();
  const [clubInfo, setClubInfo] = useState<ClubInfoData>({});
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const introRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const introInView = useInView(introRef, { once: true, margin: '-80px' });
  const membersInView = useInView(membersRef, { once: true, margin: '-80px' });
  const timelineInView = useInView(timelineRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clubRes, membersRes, timelineRes] = await Promise.all([
          getClubInfo(),
          getMembers(),
          getTimeline(),
        ]);
        setClubInfo(clubRes.data || {});
        setMembers(membersRes.data?.list || membersRes.data?.data || membersRes.data || []);
        setTimeline(timelineRes.data?.list || timelineRes.data?.data || timelineRes.data || []);
      } catch (err) {
        console.error('Failed to fetch about page data:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!location.hash) return;

    const targetId = location.hash.slice(1);
    const element = document.getElementById(targetId);
    if (!element) return;

    window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash]);

  const establishedYear = clubInfo.established || '2023';
  const coverUrl = toAssetUrl(clubInfo.cover_image) || DEFAULT_COVER_IMAGE;

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="bg-brand-dark min-h-screen">

      {/* ================================================================
          1. HERO SECTION
         ================================================================ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-brand-darker" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-darker to-brand-dark" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/3 via-transparent to-primary-500/3" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(230,168,23,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.38, 0, 0, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-500 text-sm mb-8"
          >
            <Star className="w-4 h-4" />
            <span>高校芯片科技社团</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.38, 0, 0, 1] }}
            className="section-title text-white mb-6"
          >
            关于我们
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.38, 0, 0, 1] }}
            className="text-xl md:text-2xl text-brand-light font-light max-w-3xl mx-auto leading-relaxed"
          >
            智赛宏芯社 — 聚焦芯片设计，赋能科创竞赛
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.38, 0, 0, 1] }}
            className="text-brand-muted max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            {clubInfo.slogan || '芯怀梦想，智创未来。我们致力于培养新时代集成电路领域创新人才。'}
          </motion.p>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-dark to-transparent z-10" />
      </section>

      {/* ================================================================
          2. CLUB INTRODUCTION
         ================================================================ */}
      <section className="py-20 scroll-mt-24" ref={introRef}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={introInView ? 'visible' : 'hidden'}
          >
            {/* Since year */}
            <motion.div
              variants={fadeUpVariant}
              custom={0}
              className="text-center mb-16"
            >
              <div className="section-divider mb-8" />
              <p className="text-brand-muted text-sm uppercase tracking-widest mb-4">Since</p>
              <div className="num-large text-white mb-4">{establishedYear}</div>
              <p className="text-brand-light text-lg font-light max-w-xl mx-auto">
                从{establishedYear}年创立至今，智赛宏芯社始终专注于芯片设计领域，
                坚持以赛促学、以芯会友，培养了一大批优秀的集成电路人才。
              </p>
            </motion.div>

            {/* Description columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              {/* Left - Cover image or placeholder */}
              <motion.div
                variants={cardVariant}
                className="relative overflow-hidden rounded-3xl glass-light aspect-[4/3]"
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="智赛宏芯社"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-brand-darker/50">
                    <Cpu className="w-20 h-20 text-primary-500/30 mb-4" />
                    <span className="text-brand-muted text-sm">智赛宏芯社</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-semibold text-lg">智赛宏芯社</p>
                  <p className="text-white/60 text-sm">芯怀梦想，智创未来</p>
                </div>
              </motion.div>

              {/* Right - Description */}
              <motion.div variants={fadeUpVariant} custom={1} className="flex flex-col justify-center">
                <h3 className="text-brand-muted text-sm uppercase tracking-widest mb-3">
                  社团简介
                </h3>
                <h2 className="section-title text-white mb-6" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                  我们是谁
                </h2>
                <div className="space-y-4 text-brand-light leading-relaxed">
                  <p>
                    {clubInfo.description ||
                      '智赛宏芯社是一支由学生自发组织、专注于芯片设计与集成电路领域的科技创新社团。我们汇聚了一群对芯片科技充满热情的年轻人，通过技术分享、项目实战和竞赛参与，不断探索芯片世界的无限可能。'}
                  </p>
                  <p>
                    {clubInfo.culture ||
                      '社团秉承"创新、协作、实践、卓越"的核心理念，致力于为每一位成员提供开放、包容的学习与实践平台。无论你是芯片领域的初学者，还是有一定经验的技术爱好者，都能在这里找到成长的空间。'}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Features grid */}
            <motion.div variants={fadeUpVariant} custom={2}>
              <h3 className="text-center text-brand-muted text-sm uppercase tracking-widest mb-10">
                我们的特色
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {features.map((feat, i) => (
                  <motion.div
                    key={feat.label}
                    variants={cardVariant}
                    custom={i}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-brand-card border border-white/5 card-hover"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: feat.color }}
                    />
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 text-primary-500 group-hover:bg-primary-500/10 transition-colors">
                      <feat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-white text-sm font-medium">{feat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          3. CORE MEMBERS
         ================================================================ */}
      <section id="members" className="py-20 border-t border-white/5 scroll-mt-24" ref={membersRef}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            variants={fadeUpVariant}
            custom={0}
            initial="hidden"
            animate={membersInView ? 'visible' : 'hidden'}
            className="text-center mb-16"
          >
            <div className="section-divider mb-6" />
            <h2 className="section-title text-white mb-4">
              核心成员
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              一支充满激情与活力的团队，共同推动社团发展
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="glass-light rounded-3xl p-6 text-center animate-pulse"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-white/5 mb-5" />
                  <div className="h-5 bg-white/10 rounded w-2/3 mx-auto mb-3" />
                  <div className="h-4 bg-white/10 rounded w-1/2 mx-auto mb-3" />
                  <div className="h-3 bg-white/10 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-white/10 rounded w-full mx-auto mt-2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-brand-muted mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-full border border-primary-500/30 text-primary-500 hover:bg-primary-500/10 transition-colors text-sm"
              >
                重新加载
              </button>
            </div>
          ) : members.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={membersInView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {members.map((member, i) => {
                const initials = member.name ? member.name.slice(0, 2) : '??';
                const avatarUrl = toAssetUrl(member.avatar);

                return (
                  <motion.div
                    key={member.id}
                    variants={cardVariant}
                    custom={i}
                    className="group glass-light rounded-3xl p-6 text-center card-hover"
                  >
                    {/* Avatar */}
                    <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden mb-5">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{initials}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full ring-1 ring-white/10 group-hover:ring-primary-500/50 transition-all duration-300" />
                    </div>

                    {/* Info */}
                    <h4 className="text-lg font-bold text-white mb-1">{member.name}</h4>
                    <p className="text-primary-500 text-sm font-medium mb-2">{member.role}</p>
                    <p className="text-brand-muted text-xs mb-3">{member.department}</p>
                    <p className="text-brand-light text-sm leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <p className="text-center text-brand-muted py-16">
              暂无成员信息
            </p>
          )}
        </div>
      </section>

      {/* ================================================================
          4. TIMELINE
         ================================================================ */}
      <section id="timeline" className="py-20 border-t border-white/5 scroll-mt-24" ref={timelineRef}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            variants={fadeUpVariant}
            custom={0}
            initial="hidden"
            animate={timelineInView ? 'visible' : 'hidden'}
            className="text-center mb-16"
          >
            <div className="section-divider mb-6" />
            <h2 className="section-title text-white mb-4">
              发展历程
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              一路走来，见证成长
            </p>
          </motion.div>

          {loading ? (
            <div className="space-y-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-8 animate-pulse">
                  <div className="w-20 h-8 bg-white/10 rounded" />
                  <div className="flex-1 glass-light rounded-2xl p-6">
                    <div className="h-5 bg-white/10 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : timeline.length > 0 ? (
            <div className="relative">
              {/* Timeline center line */}
              <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-white/10" />

              <div className="space-y-10">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.id || i}
                    variants={fadeUpVariant}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    className="relative flex items-start gap-8"
                  >
                    {/* Year */}
                    <div className="relative z-10 flex-shrink-0 w-[4.5rem] text-right">
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="num-large text-primary-500"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
                      >
                        {item.year}
                      </motion.span>
                    </div>

                    {/* Dot on line */}
                    <div className="absolute left-[4.5rem] top-3 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-500 z-10 ring-4 ring-brand-dark" />

                    {/* Content card */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.1, duration: 0.6, ease: [0.38, 0, 0, 1] }}
                      className="glass-light rounded-2xl p-6 flex-1 ml-[0.5rem]"
                    >
                      <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                      <p className="text-brand-light text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-brand-muted py-16">
              暂无历史记录
            </p>
          )}
        </div>
      </section>

      {/* ================================================================
          5. CTA - JOIN US
         ================================================================ */}
      <section className="py-20 border-t border-white/5" ref={ctaRef}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeUpVariant}
            custom={0}
            initial="hidden"
            animate={ctaInView ? 'visible' : 'hidden'}
            className="glass-light rounded-3xl p-12 md:p-16"
          >
            {/* Decorative glow */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <motion.div
                  variants={fadeUpVariant}
                  custom={1}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 mb-8"
                >
                  <Users className="w-8 h-8" />
                </motion.div>

                <motion.h2
                  variants={fadeUpVariant}
                  custom={2}
                  className="section-title text-white mb-4"
                >
                  加入我们
                </motion.h2>

                <motion.p
                  variants={fadeUpVariant}
                  custom={3}
                  className="text-brand-light text-lg font-light max-w-xl mx-auto mb-4 leading-relaxed"
                >
                  无论你是芯片设计初学者，还是经验丰富的技术达人
                </motion.p>

                <motion.p
                  variants={fadeUpVariant}
                  custom={4}
                  className="text-brand-muted max-w-lg mx-auto mb-10 leading-relaxed"
                >
                  智赛宏芯社欢迎每一位对芯片科技充满热情的伙伴。
                  加入我们，一起探索芯片世界的无限可能，在竞赛中成长，在实践中突破。
                </motion.p>

                <motion.div
                  variants={fadeUpVariant}
                  custom={5}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link
                    to="/join"
                    className="px-10 py-3.5 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-500 transition-colors inline-flex items-center gap-2 group shadow-lg shadow-primary-600/20"
                  >
                    立即加入
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/contact"
                    className="px-10 py-3.5 border border-white/10 text-brand-light rounded-full hover:text-white hover:border-white/30 transition-colors"
                  >
                    联系我们
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}