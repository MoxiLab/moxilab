import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, type DiscordGuild } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  ChevronLeft,
  MessageSquare,
  Swords,
  Coins,
  Wrench,
  Shield,
  Sparkles,
  BookOpen,
  Music,
  Gift,
  Ticket,
  Bell,
  Bot,
  ExternalLink,
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
  enabled: boolean;
  docsHref?: string;
}

const MODULE_META: { id: string; icon: React.ReactNode; color: string }[] = [
  { id: 'welcome',    icon: <MessageSquare className="w-6 h-6" />, color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
  { id: 'roleplay',   icon: <Swords className="w-6 h-6" />,       color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30' },
  { id: 'economy',    icon: <Coins className="w-6 h-6" />,        color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' },
  { id: 'utilities',  icon: <Wrench className="w-6 h-6" />,       color: 'from-slate-500/20 to-gray-500/20 border-slate-500/30' },
  { id: 'moderation', icon: <Shield className="w-6 h-6" />,       color: 'from-red-500/20 to-orange-500/20 border-red-500/30' },
  { id: 'ai',         icon: <Sparkles className="w-6 h-6" />,     color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30' },
  { id: 'music',      icon: <Music className="w-6 h-6" />,        color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
  { id: 'giveaways',  icon: <Gift className="w-6 h-6" />,         color: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30' },
  { id: 'tickets',    icon: <Ticket className="w-6 h-6" />,       color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30' },
  { id: 'logs',       icon: <Bell className="w-6 h-6" />,         color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30' },
  { id: 'automod',    icon: <Bot className="w-6 h-6" />,          color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
  { id: 'wiki',       icon: <BookOpen className="w-6 h-6" />,     color: 'from-lime-500/20 to-green-500/20 border-lime-500/30' },
];

function guildIconUrl(guild: DiscordGuild): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
}

function ModuleCard({ mod, index, onToggle, guildId }: { mod: Module; index: number; onToggle: (id: string, enabled: boolean) => void; guildId: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevenir navegación si se hace clic en el switch o en el link de docs
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    navigate(`/dashboard/servers/${guildId}/modules/${mod.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
      onClick={handleCardClick}
      className={`relative flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 cursor-pointer ${
        mod.enabled
          ? `bg-gradient-to-br ${mod.color}`
          : 'bg-gradient-to-br from-slate-500/10 to-slate-600/10 border-slate-500/20 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`p-2.5 rounded-xl ${mod.enabled ? 'bg-white/10' : 'bg-white/5'}`}>
          {mod.icon}
        </div>
        <div className="flex items-center gap-2">
          {mod.docsHref && (
            <a
              href={mod.docsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors hover:bg-white/10"
              title={t('server.viewDocs')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Switch
            checked={mod.enabled}
            onCheckedChange={(checked) => onToggle(mod.id, checked)}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-1">{mod.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
      </div>
    </motion.div>
  );
}

export function ServerPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const { user, guilds, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MODULE_META.map(m => [m.id, true]))
  );

  const modules = useMemo<Module[]>(() => MODULE_META.map((m) => ({
    ...m,
    enabled: enabledModules[m.id] ?? true,
    name: t(`server.modules.${m.id}.name`),
    description: t(`server.modules.${m.id}.description`),
    available: true,
    docsHref: '#',
  })), [t, enabledModules]);

  const handleToggleModule = (id: string, enabled: boolean) => {
    setEnabledModules(prev => ({ ...prev, [id]: enabled }));
  };

  useEffect(() => {
    if (isLoading) return; // Esperar a que carguen los datos
    if (!user) {
      navigate('/', { replace: true }); // No hay sesión
      return;
    }
    // Validar que el servidor exista
    if (guildId && !guilds.find((g) => g.id === guildId)) {
      navigate('/dashboard', { replace: true }); // Servidor no encontrado
    }
  }, [isLoading, user, guildId, guilds, navigate]);

  const guild = guilds.find((g) => g.id === guildId);
  const icon = guild ? guildIconUrl(guild) : null;
  const initial = (guild?.name?.[0] ?? '?').toUpperCase();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!guild) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>{t('server.notFound')}</p>
        <Button variant="outline" asChild>
          <Link to="/dashboard"><ChevronLeft className="w-4 h-4 mr-1" />{t('server.backToPanel')}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="relative overflow-hidden pb-16 pt-32">
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/3 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-purple-600/8 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb + header del servidor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('server.back')}
            </Link>

            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-primary/20 flex-shrink-0">
                {icon ? (
                  <img src={icon} alt={guild.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/60 to-purple-600/60 flex items-center justify-center text-2xl font-bold text-white">
                    {initial}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{guild.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-muted-foreground">{t('server.moxiActive')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Módulos */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-xl font-semibold text-foreground">{t('server.modulesTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('server.modulesDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => (
              <ModuleCard key={mod.id} mod={mod} index={i} onToggle={handleToggleModule} guildId={guildId ?? ''} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
