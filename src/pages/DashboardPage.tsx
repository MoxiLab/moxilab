import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, type DiscordGuild } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';
import { getLocalizedPath } from '@/lib/routing';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, Settings, Plus, Crown } from 'lucide-react';
import { getDashboardBackgroundTheme } from '@/lib/dashboard-background';

const BOT_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID ?? '';
const BOT_PERMISSIONS = '8'; // administrator

function guildIconUrl(guild: DiscordGuild): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
}

function inviteUrl(guildId: string): string {
  const params = new URLSearchParams({
    client_id: BOT_CLIENT_ID,
    permissions: BOT_PERMISSIONS,
    scope: 'bot applications.commands',
    guild_id: guildId,
    disable_guild_select: 'true',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function GuildCard({ guild }: { guild: DiscordGuild }) {
  const icon = guildIconUrl(guild);
  const initial = (guild.name?.[0] ?? '?').toUpperCase();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-landscape-card relative flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-200 group
        ${guild.hasBot
          ? 'bg-card/70 border-primary/30 hover:border-primary/60 hover:bg-card'
          : 'bg-card/60 border-border/70 hover:border-border hover:bg-card'
        }`}
    >
      {/* Ícono del servidor */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/10 group-hover:ring-primary/30 transition-all">
        {icon ? (
          <img src={icon} alt={guild.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/60 to-purple-600/60 flex items-center justify-center text-xl font-bold text-white">
            {initial}
          </div>
        )}
      </div>

      {/* Nombre */}
      <p className="text-sm font-semibold text-foreground text-center leading-tight line-clamp-2 w-full">
        {guild.name}
      </p>

      {/* Badge de estado */}
      {guild.hasBot && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-background" title={t('dashboard.moxiHere')} />
      )}

      {/* Botón */}
      {guild.hasBot ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs gap-1.5"
          onClick={() => navigate(`/dashboard/servers/${guild.id}`)}
        >
          <Settings className="w-3.5 h-3.5" />
          {t('dashboard.manage')}
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full text-xs gap-1.5 bg-primary/80 hover:bg-primary"
          asChild
        >
          <a href={inviteUrl(guild.id)} target="_blank" rel="noopener noreferrer">
            <Plus className="w-3.5 h-3.5" />
            {t('dashboard.invite')}
          </a>
        </Button>
      )}
    </motion.div>
  );
}

function UserAvatar({ user, avatarUrl }: { user: ReturnType<typeof useAuth>['user']; avatarUrl: string | null }) {
  if (!user) return null;
  const resolvedAvatarUrl = avatarUrl ?? (user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`);
  const displayName = user.globalName || user.username;

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/30">
        <img src={resolvedAvatarUrl} alt={displayName} className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{displayName}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, guilds, profileAvatarUrl, isLoading, isExchangingCode, isRefreshingGuilds, logout, refreshGuilds, setProfileAvatarUrl } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

  // Si no hay sesión y no estamos cargando, redirigir al inicio
  useEffect(() => {
    if (!isLoading && !isExchangingCode && !user) {
      navigate(getLocalizedPath(language, 'home'), { replace: true });
    }
  }, [isLoading, isExchangingCode, user, navigate, language]);

  // Refrescar servidores cada vez que se abre el dashboard (para detectar bots recién invitados)
  useEffect(() => {
    if (!user || isLoading || isExchangingCode) return;

    let cancelled = false;
    const syncGuilds = () => {
      if (!cancelled) refreshGuilds();
    };

    syncGuilds();

    const handleFocus = () => syncGuilds();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncGuilds();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isLoading, isExchangingCode, refreshGuilds]);

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMessage('Selecciona una imagen válida.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage('La imagen debe pesar menos de 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        setAvatarMessage('No se pudo leer la imagen.');
        return;
      }

      setProfileAvatarUrl(result);
      setAvatarMessage('Foto de perfil actualizada en Moxi.');
    };
    reader.onerror = () => setAvatarMessage('No se pudo leer la imagen.');
    reader.readAsDataURL(file);
  };

  const withBot = guilds.filter((g) => g.hasBot);
  const withoutBot = guilds.filter((g) => !g.hasBot);
  const bgTheme = useMemo(() => getDashboardBackgroundTheme(`${user?.id ?? 'guest'}-dashboard`), [user?.id]);

  if (isLoading || isExchangingCode) {
    return (
      <main className="sk-page-flow min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">{isExchangingCode ? t('dashboard.signingIn') : t('dashboard.loading')}</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="sk-page-flow dashboard-landscape min-h-screen">
      {/* Hero del dashboard */}
      <div className="dashboard-landscape-shell relative overflow-hidden pb-12 pt-32" style={bgTheme.containerStyle}>
        {/* Blobs de fondo */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full blur-3xl" style={bgTheme.blobOneStyle} />
          <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full blur-3xl" style={bgTheme.blobTwoStyle} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabecera del usuario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10"
          >
            <div className="flex flex-col gap-4">
              <UserAvatar user={user} avatarUrl={profileAvatarUrl} />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {t('dashboard.changeAvatar')}
                </Button>
                {profileAvatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setProfileAvatarUrl(null);
                      setAvatarMessage('Se restauró la foto de Discord.');
                    }}
                  >
                    {t('dashboard.resetAvatar')}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground max-w-md">
                {t('dashboard.avatarHint')}
              </p>
              {avatarMessage && (
                <p className="text-xs text-muted-foreground">{avatarMessage}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isRefreshingGuilds}
                onClick={() => {
                  void refreshGuilds();
                }}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingGuilds ? 'animate-spin' : ''}`} />
                {isRefreshingGuilds ? t('dashboard.refreshing') : t('dashboard.refresh')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                {t('dashboard.logout')}
              </Button>
            </div>
          </motion.div>

          {/* Servidores configurables */}
          {withBot.length > 0 && (
            <section className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-medium text-green-400">{t('dashboard.configurable')}</span>
                </div>
                <span className="text-muted-foreground text-sm">{withBot.length} {withBot.length !== 1 ? t('dashboard.serverPlural') : t('dashboard.serverSingular')} {t('dashboard.whereAdmin')}</span>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {withBot.map((guild, i) => (
                  <motion.div key={guild.id} transition={{ delay: 0.05 * i }}>
                    <GuildCard guild={guild} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {withoutBot.length > 0 && (
            <section className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="dashboard-landscape-pill flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Crown className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t('dashboard.canInvite')}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {withoutBot.length} {withoutBot.length !== 1 ? t('dashboard.serverPlural') : t('dashboard.serverSingular')} {t('dashboard.whereAdmin')}
                </span>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {withoutBot.map((guild, i) => (
                  <motion.div key={guild.id} transition={{ delay: 0.05 * i }}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="dashboard-landscape-card relative flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-200 group bg-card/60 border-border/70 hover:border-border hover:bg-card"
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                        {guildIconUrl(guild) ? (
                          <img src={guildIconUrl(guild) ?? undefined} alt={guild.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/60 to-purple-600/60 flex items-center justify-center text-xl font-bold text-white">
                            {(guild.name?.[0] ?? '?').toUpperCase()}
                          </div>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-foreground text-center leading-tight line-clamp-2 w-full">
                        {guild.name}
                      </p>

                      <Button
                        size="sm"
                        className="w-full text-xs gap-1.5 bg-primary/80 hover:bg-primary"
                        asChild
                      >
                        <a href={inviteUrl(guild.id)} target="_blank" rel="noopener noreferrer">
                          <Plus className="w-3.5 h-3.5" />
                          {t('dashboard.invite')}
                        </a>
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {guilds.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-muted-foreground"
            >
              <p className="text-lg">{t('dashboard.noServers')}</p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
