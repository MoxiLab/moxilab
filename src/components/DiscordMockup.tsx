import { useState, type ReactNode } from 'react';
import { useI18n } from '@/lib/i18n';

interface DiscordMockupProps {
  children: ReactNode;
  className?: string;
}

export function DiscordMockup({ children, className = '' }: DiscordMockupProps) {
  const { t } = useI18n();

  return (
    <div
      className={`bg-card text-foreground rounded-2xl shadow-2xl overflow-hidden border border-border/80 ${className}`}
    >
      {/* Discord header */}
      <div className="bg-muted/70 px-4 py-3 flex items-center gap-2 border-b border-border/80">
        <div className="w-3 h-3 rounded-full bg-[#ed4245]" />
        <div className="w-3 h-3 rounded-full bg-[#faa61a]" />
        <div className="w-3 h-3 rounded-full bg-[#3ba55d]" />
        <div className="flex-1 text-center text-xs text-muted-foreground">
          {t('discord.preview')}
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
  tagClassName?: string;
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
  tagClassName,
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
        <div className="w-10 h-10 rounded-2xl flex-shrink-0 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-border flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">
            {(initials ?? username).slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className={nameClassName ?? 'font-semibold text-pink-500'}>
              {username}
            </span>
            {tag ? (
              <span className={tagClassName ?? 'px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] font-semibold rounded'}>
                {tag}
              </span>
            ) : null}
            {app && (
              <span className="px-1.5 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded uppercase">
                APP
              </span>
            )}
          </div>
          {timestamp ? (
            <span className="text-[11px] text-muted-foreground shrink-0">{timestamp}</span>
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
      style={{ backgroundColor: 'hsl(var(--muted))' }}
    >
      <div className="flex">
        <div className="w-1" style={{ backgroundColor: color }} />
        <div className="p-3 flex-1">
          {title && (
            <h4 className="font-semibold text-foreground text-sm">{title}</h4>
          )}
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
