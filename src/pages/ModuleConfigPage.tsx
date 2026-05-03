import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { useModules } from '@/hooks/use-modules';
import { getDashboardBackgroundTheme } from '@/lib/dashboard-background';

function prettyModuleName(id: string) {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ModuleConfigPage() {
  const { guildId, moduleId } = useParams<{ guildId: string; moduleId: string }>();
  const { user, guilds, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { modules: moduleMeta } = useModules();

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
          <Link to="/dashboard">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('server.backToPanel')}
          </Link>
        </Button>
      </main>
    );
  }

  if (!moduleId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Módulo no encontrado</p>
        <Button variant="outline" asChild>
          <Link to={`/dashboard/servers/${guildId}`}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver
          </Link>
        </Button>
      </main>
    );
  }

  const moduleNameKey = `server.modules.${moduleId}.name`;
  const moduleDescKey = `server.modules.${moduleId}.description`;
  const moduleNameText = t(moduleNameKey);
  const moduleDescText = t(moduleDescKey);
  const moduleName = moduleNameText === moduleNameKey ? prettyModuleName(moduleId) : moduleNameText;
  const moduleDesc = moduleDescText === moduleDescKey ? t('server.modulesDesc') : moduleDescText;
  const moduleDef = moduleMeta.find((m) => m.id === moduleId);
  const ModuleIcon = moduleDef?.Icon;
  const bgTheme = useMemo(() => getDashboardBackgroundTheme(`${guildId ?? 'server'}-${moduleId}-config`), [guildId, moduleId]);

  return (
    <main className="min-h-screen">
      <div className="relative overflow-hidden pb-16 pt-32" style={bgTheme.containerStyle}>
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/3 w-96 h-96 rounded-full blur-3xl" style={bgTheme.blobOneStyle} />
          <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl" style={bgTheme.blobTwoStyle} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Link
              to={`/dashboard/servers/${guildId}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              {guild.name}
            </Link>

            {/* Module Header */}
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${moduleDef?.configColor ?? 'from-slate-500 to-slate-600'} text-white`}>
                {ModuleIcon && <ModuleIcon className="w-8 h-8" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{moduleName}</h1>
                <p className="text-muted-foreground">{moduleDesc}</p>
              </div>
            </div>
          </motion.div>

          {/* Config Sections */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Placeholder sections for different modules */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Configuración general</h2>
              <p className="text-sm text-muted-foreground">
                Las opciones de configuración para este módulo estarán disponibles próximamente.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Permisos</h2>
              <p className="text-sm text-muted-foreground">
                Configura quién puede usar este módulo en tu servidor.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Comandos</h2>
              <p className="text-sm text-muted-foreground">
                Ver y personalizar los comandos de este módulo.
              </p>
              <Button className="mt-4 gap-2" variant="outline">
                Ver documentación <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
