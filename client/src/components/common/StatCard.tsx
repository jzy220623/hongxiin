import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
}

export default function StatCard({ icon: Icon, label, value, suffix = '' }: StatCardProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 mb-3">
        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
        {count}
        <span className="text-xl text-primary-500">{suffix}</span>
      </div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </motion.div>
  );
}