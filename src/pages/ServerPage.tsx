import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, type DiscordGuild } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { useModules } from '@/hooks/use-modules';
import { getDashboardBackgroundTheme } from '@/lib/dashboard-background';

function prettyModuleName(id: string) {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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

function guildIconUrl(guild: DiscordGuild): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
}

function ModuleCard({ mod, index, onToggle, guildId }: { mod: Module; index: number; onToggle: (id: string, enabled: boolean) => void; guildId: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevenir navegación si se hace clic en el switch o en el link de docs
    if ((e.target as HTMLElement).closest('[data-module-toggle]') || (e.target as HTMLElement).closest('a')) {
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
          <div
            data-module-toggle
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Switch
              checked={mod.enabled}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onCheckedChange={(checked) => onToggle(mod.id, checked)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
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
  const { modules: moduleMeta } = useModules();

  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [savingModules, setSavingModules] = useState<Record<string, boolean>>({});

  const modules = useMemo<Module[]>(() => moduleMeta.map((m) => {
    const Icon = m.Icon;
    const nameKey = `server.modules.${m.id}.name`;
    const descriptionKey = `server.modules.${m.id}.description`;
    const nameText = t(nameKey);
    const descriptionText = t(descriptionKey);
    return {
      id: m.id,
      icon: <Icon className="w-6 h-6" />,
      color: m.dashboardColor,
      enabled: enabledModules[m.id] ?? true,
      name: nameText === nameKey ? prettyModuleName(m.id) : nameText,
      description: descriptionText === descriptionKey ? t('server.modulesDesc') : descriptionText,
      available: true,
      docsHref: undefined,
    };
  }), [t, enabledModules, moduleMeta]);

  const handleToggleModule = async (id: string, enabled: boolean) => {
    if (!guildId) return;

    setEnabledModules((prev) => ({ ...prev, [id]: enabled }));
    setSavingModules((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`/api/guilds/${guildId}/module-states/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error(`Module toggle API responded ${response.status}`);
      }
    } catch (error) {
      console.error('No se pudo guardar el estado del modulo:', error);
      setEnabledModules((prev) => ({ ...prev, [id]: !enabled }));
    } finally {
      setSavingModules((prev) => ({ ...prev, [id]: false }));
    }
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

  useEffect(() => {
    if (!guildId) return;

    const controller = new AbortController();

    fetch(`/api/guilds/${guildId}/module-states`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Module states API responded ${response.status}`);
        }
        return response.json() as Promise<{ moduleStates?: Record<string, boolean> }>;
      })
      .then((data) => {
        const moduleStates = data?.moduleStates && typeof data.moduleStates === 'object'
          ? data.moduleStates
          : {};
        setEnabledModules(moduleStates);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('No se pudieron cargar los estados de módulos:', error);
      });

    return () => controller.abort();
  }, [guildId]);

  const guild = guilds.find((g) => g.id === guildId);
  const icon = guild ? guildIconUrl(guild) : null;
  const initial = (guild?.name?.[0] ?? '?').toUpperCase();
  const bgTheme = useMemo(() => getDashboardBackgroundTheme(`${guildId ?? 'server'}-modules`), [guildId]);

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
      <div className="relative overflow-hidden pb-16 pt-32" style={bgTheme.containerStyle}>
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/3 w-96 h-96 rounded-full blur-3xl" style={bgTheme.blobOneStyle} />
          <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl" style={bgTheme.blobTwoStyle} />
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
              <div key={mod.id} className="relative">
                <ModuleCard mod={mod} index={i} onToggle={handleToggleModule} guildId={guildId ?? ''} />
                {savingModules[mod.id] && (
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-center text-[10px] font-medium text-white/70 backdrop-blur">
                    Guardando...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
