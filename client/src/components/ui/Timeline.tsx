import { motion } from 'framer-motion';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: 'vertical' | 'horizontal';
}

export default function Timeline({ items, variant = 'vertical' }: TimelineProps) {
  if (variant === 'horizontal') {
    return (
      <div className="relative overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max px-4">
          {/* Center line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800" />

          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col items-center text-center"
              style={{ width: 180 }}
            >
              {/* Dot */}
              <div className="relative z-10 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-gray-950 mb-4" />
              <span className="text-sm font-display font-bold text-primary-600 dark:text-primary-400 mb-2">
                {item.year}
              </span>
              <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Center line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2" />

      <div className="space-y-8">
        {items.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-start gap-4 md:gap-0 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 top-1 w-3 h-3 rounded-full bg-primary-500 border-2 border-white dark:border-gray-950 -translate-x-1/2 z-10" />

              {/* Content */}
              <div className={`ml-10 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                <span className="inline-block text-sm font-display font-bold text-primary-600 dark:text-primary-400 mb-1">
                  {item.year}
                </span>
                <h4 className="text-base font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}