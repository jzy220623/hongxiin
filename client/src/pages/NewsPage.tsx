import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, ChevronRight, Search } from 'lucide-react';
import { getNews } from '../api';
import { formatDate } from '../utils/helpers';

const DEFAULT_COVER_IMAGE = '/images/logo2.png';
const toAssetUrl = (value?: string) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  cover_image?: string;
  category?: string;
  published_at: string;
}

const categories = [
  { key: '', label: '全部' },
  { key: 'club_news', label: '社团动态' },
  { key: 'event_report', label: '赛事资讯' },
  { key: 'tech_article', label: '技术分享' },
  { key: 'notice', label: '招新公告' },
];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.38, 0, 0, 1] },
  }),
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page, pageSize };
      if (category) params.category = category;

      const res = await getNews(params);
      const data = res.data;
      setNews(data?.list || data?.data || data || []);
      setTotalPages(
        data?.totalPages || data?.total_page || Math.ceil((data?.total || 0) / pageSize) || 1
      );
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('加载新闻列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleCategoryChange = (c: string) => {
    setCategory(c);
    setPage(1);
  };

  const getCoverUrl = (item: NewsItem): string | null => {
    return toAssetUrl(item.cover_image) || DEFAULT_COVER_IMAGE;
  };

  return (
    <div className="bg-brand-dark min-h-screen">
      {/* ===== Hero Section ===== */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-darker via-brand-dark to-brand-dark" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-3xl" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-500 text-sm mb-8"
          >
            <Newspaper className="w-4 h-4" />
            <span>新闻资讯</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="section-title text-white mb-6"
          >
            新闻动态
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-brand-light font-light max-w-2xl mx-auto leading-relaxed"
          >
            关注社团最新动态与技术前沿
          </motion.p>
        </div>
      </section>

      {/* ===== Category Filter ===== */}
      <section className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => handleCategoryChange(c.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === c.key
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'bg-white/5 text-brand-light border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== News Grid ===== */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-brand-card animate-pulse overflow-hidden">
                  <div className="h-48 bg-brand-darker" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-brand-darker rounded w-3/4" />
                    <div className="h-4 bg-brand-darker rounded w-full" />
                    <div className="h-4 bg-brand-darker rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Newspaper className="w-16 h-16 text-brand-muted mx-auto mb-4" />
              <p className="text-brand-light text-lg">{error}</p>
              <button
                onClick={fetchNews}
                className="mt-4 px-5 py-2.5 rounded-full bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20"
              >
                重试
              </button>
            </div>
          ) : news.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, i) => {
                  const coverUrl = getCoverUrl(item);
                  return (
                    <motion.div
                      key={item.id}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-50px' }}
                      variants={fadeUpVariant}
                    >
                      <Link
                        to={`/news/${item.id}`}
                        className="block rounded-2xl overflow-hidden bg-brand-card border border-white/5 card-hover group"
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-brand-darker">
                          <img
                            src={coverUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />

                          {/* Date badge */}
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-bold shadow-lg">
                            {formatDate(item.published_at)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-brand-muted text-sm leading-relaxed line-clamp-2 mb-4">
                            {item.summary}
                          </p>

                          {/* Read more */}
                          <div className="flex items-center gap-1 text-primary-500 text-sm font-medium group/link">
                            <span>阅读全文</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-brand-light hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    上一页
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                        page === p
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                          : 'bg-white/5 border border-white/10 text-brand-light hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-brand-light hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-brand-muted mx-auto mb-4" />
              <p className="text-brand-light text-lg">暂无新闻</p>
              <p className="text-brand-muted text-sm mt-2">请调整筛选条件或稍后再来</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}