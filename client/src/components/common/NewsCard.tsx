import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { Calendar } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  cover_image?: string;
  category?: string;
  published_at: string;
}

interface NewsCardProps {
  news: NewsItem;
}

const categoryLabels: Record<string, string> = {
  club_news: '社团新闻',
  event_report: '活动报道',
  tech_article: '技术文章',
  notice: '通知公告',
};

export default function NewsCard({ news }: NewsCardProps) {
  const categoryLabel = news.category ? categoryLabels[news.category] || news.category : null;

  return (
    <Link to={`/news/${news.id}`}>
      <div className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {news.cover_image ? (
            <img
              src={news.cover_image}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {categoryLabel && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
              {categoryLabel}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {news.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{news.summary}</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(news.published_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}