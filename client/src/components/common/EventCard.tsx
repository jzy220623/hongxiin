import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatDate, getEventStatusColor, getEventStatusLabel, getEventTypeLabel } from '../../utils/helpers';

interface EventItem {
  id: number;
  title: string;
  description: string;
  cover_image?: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const statusColor = getEventStatusColor(event.status);
  const statusLabel = getEventStatusLabel(event.status);
  const typeLabel = getEventTypeLabel(event.type);

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold line-clamp-1">{event.title}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {event.description}
        </p>

        <div className="mt-3 space-y-1.5 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatDate(event.start_date)} ~ {formatDate(event.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          查看详情
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}