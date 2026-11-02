interface MemberItem {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  user_avatar?: string;
  bio: string;
}

interface MemberCardProps {
  member: MemberItem;
}

export default function MemberCard({ member }: MemberCardProps) {
  const initials = member.name.slice(0, 2);
  const displayAvatar = member.user_avatar || member.avatar;

  return (
    <div className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1">
      {/* Avatar */}
      <div className="relative mx-auto w-20 h-20 rounded-full overflow-hidden mb-4">
        {displayAvatar ? (
          <img src={displayAvatar} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-primary-400 transition-all duration-300" />
      </div>

      {/* Info */}
      <h4 className="text-base font-semibold">{member.name}</h4>
      <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{member.role}</p>
      <p className="text-xs text-gray-400 mt-1">{member.department}</p>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
        {member.bio}
      </p>
    </div>
  );
}