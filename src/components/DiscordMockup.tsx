import { useState, type ReactNode } from 'react';

interface DiscordMockupProps {
  children: ReactNode;
  className?: string;
}

export function DiscordMockup({ children, className = '' }: DiscordMockupProps) {
  return (
    <div
      className={`bg-[#36393f] rounded-2xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* Discord header */}
      <div className="bg-[#2f3136] px-4 py-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#ed4245]" />
        <div className="w-3 h-3 rounded-full bg-[#faa61a]" />
        <div className="w-3 h-3 rounded-full bg-[#3ba55d]" />
        <div className="flex-1 text-center text-xs text-white/60">
          Moxi Preview
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface DiscordMessageProps {
  avatar?: string | null;
  initials?: string;
  username: string;
  nameClassName?: string;
  tag?: string;
  timestamp?: string;
  app?: boolean;
  children: ReactNode;
}

export function DiscordMessage({
  avatar = '/moxi-hero.jpg',
  initials,
  username,
  nameClassName,
  tag,
  timestamp,
  app = false,
  children,
}: DiscordMessageProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(avatar) && !avatarFailed;

  return (
    <div className="flex gap-3">
      {showAvatar ? (
        <img
          src={avatar ?? undefined}
          alt={username}
          className="w-10 h-10 rounded-2xl flex-shrink-0"
          onError={() => setAvatarFailed(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded-2xl flex-shrink-0 bg-gradient-to-br from-indigo-400/40 to-fuchsia-400/30 border border-white/10 flex items-center justify-center">
          <span className="text-xs font-bold text-white/90">
            {(initials ?? username).slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={nameClassName ?? 'font-semibold text-[#ec4899]'}>
            {username}
          </span>
          {tag ? (
            <span className="px-1.5 py-0.5 bg-white/10 text-white/70 text-[10px] font-bold rounded uppercase">
              {tag}
            </span>
          ) : null}
          {app && (
            <span className="px-1.5 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded uppercase">
              APP
            </span>
          )}
          {timestamp ? (
            <span className="text-[11px] text-white/40">{timestamp}</span>
          ) : null}
        </div>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

interface DiscordEmbedProps {
  title?: string;
  description?: string;
  color?: string;
  children?: ReactNode;
}

export function DiscordEmbed({
  title,
  description,
  color = '#ec4899',
  children,
}: DiscordEmbedProps) {
  return (
    <div
      className="mt-2 rounded-lg overflow-hidden"
      style={{ backgroundColor: '#2f3136' }}
    >
      <div className="flex">
        <div className="w-1" style={{ backgroundColor: color }} />
        <div className="p-3 flex-1">
          {title && (
            <h4 className="font-semibold text-white text-sm">{title}</h4>
          )}
          {description && (
            <p className="text-[#dcddde] text-sm mt-1">{description}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
