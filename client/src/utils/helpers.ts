export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

export function getEventStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'ongoing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'ended':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function getEventStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return '报名中';
    case 'upcoming':
      return '即将开始';
    case 'ongoing':
      return '进行中';
    case 'ended':
      return '已结束';
    default:
      return status;
  }
}

export function getEventTypeLabel(type: string): string {
  switch (type) {
    case 'chip_design':
      return '芯片设计';
    case 'sci_tech':
      return '科技创新';
    case 'training':
      return '技能培训';
    default:
      return type;
  }
}

export function getAwardLevelColor(level: string): string {
  switch (level) {
    case 'national':
      return 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20';
    case 'provincial':
      return 'border-slate-400 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20';
    case 'school':
      return 'border-amber-600 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20';
    default:
      return 'border-gray-300 dark:border-gray-600';
  }
}

export function getAwardLevelLabel(level: string): string {
  switch (level) {
    case 'national':
      return '国家级';
    case 'provincial':
      return '省级';
    case 'school':
      return '校级';
    default:
      return level;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileIcon(type: string): string {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return 'file-text';
    case 'doc':
    case 'docx':
      return 'file-text';
    case 'ppt':
    case 'pptx':
      return 'presentation';
    case 'xls':
    case 'xlsx':
      return 'table';
    case 'zip':
    case 'rar':
    case '7z':
      return 'archive';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'video';
    case 'mp3':
    case 'wav':
      return 'music';
    default:
      return 'file';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'tutorial':
      return '教程';
    case 'datasheet':
      return '数据手册';
    case 'software':
      return '软件工具';
    case 'paper':
      return '论文资料';
    case 'other':
      return '其他';
    default:
      return category;
  }
}

export function getNewsCategoryLabel(category: string): string {
  switch (category) {
    case 'club_news':
      return '社团新闻';
    case 'event_report':
      return '活动报道';
    case 'tech_article':
      return '技术文章';
    case 'notice':
      return '通知公告';
    default:
      return category;
  }
}