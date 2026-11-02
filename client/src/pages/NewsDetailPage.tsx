import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, AlertCircle, RefreshCw } from 'lucide-react';
import { getNewsDetail, getNews } from '../api';
import { formatDate, getNewsCategoryLabel } from '../utils/helpers';
import NewsCard from '../components/common/NewsCard';
import Button from '../components/ui/Button';

const DEFAULT_COVER_IMAGE = '/images/logo2.png';

const toAssetUrl = (value?: string) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};

interface NewsDetail {
  id: number;
  title: string;
  summary: string;
  content: string;
  cover_image?: string;
  category?: string;
  published_at: string;
  author?: string;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  cover_image?: string;
  category?: string;
  published_at: string;
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [detailRes, relatedRes] = await Promise.all([
        getNewsDetail(Number(id)),
        getNews({ pageSize: 3, page: 1 }),
      ]);
      setNews(detailRes.data);
      const relatedData = relatedRes.data;
      const list = relatedData?.list || relatedData?.data || relatedData || [];
      setRelatedNews((list as NewsItem[]).filter((item: NewsItem) => item.id !== Number(id)).slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch news detail:', err);
      setError('加载新闻详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBack = () => navigate('/news');
  const categoryLabel = news?.category ? getNewsCategoryLabel(news.category) : null;
  const heroCover = toAssetUrl(news?.cover_image) || DEFAULT_COVER_IMAGE;
  const readingMinutes = Math.max(1, Math.ceil(((news?.content || news?.summary || '').length || 1) / 200));

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{error}</p>
          <Button variant="primary" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" /> 重试
          </Button>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">新闻不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Area */}
      <section className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={heroCover}
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute inset-0 bg-circuit opacity-10" />

        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-4xl mx-auto px-4 pb-8 md:pb-12">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> 返回新闻列表
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 mb-3"
          >
            {categoryLabel && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
                <Tag className="w-3 h-3 inline mr-1" />
                {categoryLabel}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-white/70">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(news.published_at)}
            </span>
            {news.author && (
              <span className="text-sm text-white/70">作者：{news.author}</span>
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white leading-tight"
          >
            {news.title}
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="prose prose-gray dark:prose-invert max-w-none"
              >
                <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-8 whitespace-pre-wrap">
                  {news.content?.trim() || news.summary?.trim() || '暂无正文，以下为示意内容：\n\n智赛宏芯社将持续更新赛事动态、技术分享和成员故事。'}
                </div>
              </motion.article>
            </div>

            {/* Sidebar: Related News */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-24"
              >
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 mb-4">
                  <h3 className="text-lg font-bold mb-4">文章信息</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-400">发布时间</span>
                      <span className="text-gray-700 dark:text-gray-200">{formatDate(news.published_at)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-400">分类</span>
                      <span className="text-gray-700 dark:text-gray-200">{categoryLabel || '未分类'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-400">作者</span>
                      <span className="text-gray-700 dark:text-gray-200">{news.author || '智赛宏芯社编辑部'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-400">阅读时长</span>
                      <span className="text-gray-700 dark:text-gray-200">{readingMinutes} 分钟</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
                  <h3 className="text-lg font-bold mb-4">相关新闻</h3>
                  {relatedNews.length > 0 ? (
                    <div className="space-y-4">
                      {relatedNews.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/news/${item.id}`)}
                          className="cursor-pointer group"
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <img
                                src={toAssetUrl(item.cover_image) || DEFAULT_COVER_IMAGE}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(item.published_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">暂无相关新闻</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}