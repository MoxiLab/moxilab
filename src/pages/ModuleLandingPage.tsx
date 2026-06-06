import { useEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { getLocalizedPath } from '@/lib/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketingLanding } from '@/components/MarketingLanding';
import { ArrowRight, BookOpen, Bot, CalendarHeart, CircleDot, Coins, Gift, Heart, MessageSquareText, Music4, PlayCircle, Shield, Sparkles, Users, WandSparkles, Wrench, Zap } from 'lucide-react';

function prettyModuleName(id: string) {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const MODULE_ALIASES: Record<string, string> = {
  economy: 'currency',
  social: 'streaming',
  'social-alerts': 'streaming',
  socialalerts: 'streaming',
};

export function ModuleLandingPage() {
  const { moduleId } = useParams();
  const { t, language } = useI18n();
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef<string | undefined>(undefined);

  const rawId = decodeURIComponent(moduleId ?? '').trim().toLowerCase();
  const normalizedId = MODULE_ALIASES[rawId] ?? rawId;

  useEffect(() => {
    if (previousThemeRef.current === undefined) {
      previousThemeRef.current = theme;
    }

    setTheme('dark');

    return () => {
      const previousTheme = previousThemeRef.current ?? 'system';
      setTheme(previousTheme);
      previousThemeRef.current = undefined;
    };
  }, [normalizedId, setTheme]);

  const titleKey = normalizedId === 'streaming'
    ? 'server.modules.streaming.name'
    : `modulesShowcase.modules.${normalizedId}.title`;
  const descriptionKey = normalizedId === 'streaming'
    ? 'server.modules.streaming.description'
    : `modulesShowcase.modules.${normalizedId}.description`;
  const title = t(titleKey);
  const description = t(descriptionKey);
  const homePath = getLocalizedPath(language, 'home');
  const dashboardPath = getLocalizedPath(language, 'dashboard');

  if (normalizedId !== 'streaming' && title === titleKey && description === descriptionKey) {
    return <Navigate to={homePath} replace />;
  }

  if (normalizedId === 'streaming') {
    const socialTitle = language === 'es' ? 'Alertas Sociales' : 'Social Alerts';
    const socialSubtitle =
      language === 'es'
        ? 'Conecta Twitch, YouTube, Kick, TikTok, Instagram, X, Bluesky y Reddit. Mantén a tu comunidad informada en tiempo real desde un solo dashboard.'
        : 'Connect Twitch, YouTube, Kick, TikTok, Instagram, X, Bluesky and Reddit from a single dashboard.';
    const socialPlatforms = [
      { name: 'Twitch', iconSrc: 'https://cdn.simpleicons.org/twitch/9146FF' },
      { name: 'YouTube', iconSrc: 'https://cdn.simpleicons.org/youtube/FF0000' },
      { name: 'Kick', iconSrc: 'https://cdn.simpleicons.org/kick/53FC18' },
      { name: 'TikTok Lives', iconSrc: 'https://cdn.simpleicons.org/tiktok/FFFFFF' },
      { name: 'Instagram', iconSrc: 'https://cdn.simpleicons.org/instagram/E4405F' },
      { name: 'X (Twitter)', iconSrc: 'https://cdn.simpleicons.org/x/FFFFFF' },
      { name: 'Bluesky', iconSrc: 'https://cdn.simpleicons.org/bluesky/1185FE' },
      { name: 'Reddit', iconSrc: 'https://cdn.simpleicons.org/reddit/FF4500' },
      { name: 'TikTok Posts', iconSrc: 'https://cdn.simpleicons.org/tiktok/FFFFFF' },
    ];

    return (
      <main className="relative overflow-hidden pt-24 bg-transparent">
        <div className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-[3rem] rotate-12 bg-pink-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-28 top-[42%] h-80 w-80 rounded-[3rem] -rotate-6 bg-cyan-400/16 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-[8%] h-72 w-72 rounded-[3rem] rotate-6 bg-fuchsia-400/12 blur-3xl" />
        <section className="relative overflow-hidden border-b py-14">
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr,1fr] lg:px-8">
            <div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
                {socialTitle}
              </Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                {language === 'es' ? 'Unifica tus alertas sociales en Discord' : 'Unify your social alerts in Discord'}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {socialSubtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <a href="https://discord.com/oauth2/authorize?client_id=429457053791158281&permissions=399431429375&scope=bot%20applications.commands" target="_blank" rel="noopener noreferrer">
                    {language === 'es' ? 'Invitar a la Bot' : 'Invite Bot'}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={getLocalizedPath(language, 'dashboard')}>
                    {language === 'es' ? 'Abrir Dashboard' : 'Open Dashboard'}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border bg-card/80 p-5 shadow-xl backdrop-blur">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <CircleDot className="h-4 w-4 text-red-500" />
                {language === 'es' ? 'Alerta en vivo' : 'Live alert'}
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">MoxiAPP</p>
                <p className="mt-1 text-base font-semibold">StreamerName {language === 'es' ? 'está en vivo en Twitch' : 'is now live on Twitch'}!</p>
                <h3 className="mt-3 text-lg font-bold">Playing Minecraft - Survival Series Ep. 42</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {language === 'es'
                    ? 'Join the stream and hang out with the community! Viewers 2,640 - Game Minecraft.'
                    : 'Join the stream and hang out with the community! Viewers 2,640 - Game Minecraft.'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 overflow-hidden py-4">
            <motion.div
              className="flex w-max gap-5"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
            >
              {[...socialPlatforms, ...socialPlatforms].map((platform, index) => (
                <span
                  key={`${platform.name}-${index}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80"
                >
                  <img
                    src={platform.iconSrc}
                    alt={platform.name}
                    className="h-4 w-4 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{platform.name}</span>
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        <div>
          <section className="border-b border-white/10 py-12 sm:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-pink-200/70">
                {language === 'es' ? 'Beneficios' : 'Benefits'}
              </p>
              <h2 className="mt-2 text-center text-2xl font-bold text-white sm:text-3xl">
                {language === 'es' ? '¿Por qué configurar alertas sociales?' : 'Why configure social alerts?'}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-7 text-white/70">
                {language === 'es'
                  ? 'Convierte tu servidor de Discord en un hub donde tu comunidad nunca se pierde una actualización.'
                  : 'Turn your Discord server into a hub where your community never misses an update.'}
              </p>
              <div className="mt-8 grid gap-4 lg:grid-cols-4">
                {[
                  {
                    icon: Users,
                    title: language === 'es' ? 'Haz crecer tu audiencia' : 'Grow your audience',
                    text: language === 'es' ? 'Notifica a los miembros en el momento en que transmites o publicas. Más ojos en tu contenido, menos promoción manual.' : 'Notify members right when you stream or publish. More eyes on your content, less manual promotion.',
                  },
                  {
                    icon: PlayCircle,
                    title: language === 'es' ? 'Notificaciones en tiempo real' : 'Real-time notifications',
                    text: language === 'es' ? 'Las alertas se envían al instante cuando un creador transmite, sube o publica, sin retrasos.' : 'Alerts are sent instantly when a creator streams, uploads, or posts without delays.',
                  },
                  {
                    icon: BookOpen,
                    title: language === 'es' ? 'Configuración sin código' : 'No-code setup',
                    text: language === 'es' ? 'Configura todo desde el dashboard web. Elige un canal, añade cuentas y listo.' : 'Set everything from the web dashboard. Pick a channel, add accounts, and done.',
                  },
                  {
                    icon: CircleDot,
                    title: language === 'es' ? 'Todo en un solo lugar' : 'All in one place',
                    text: language === 'es' ? 'Gestiona alertas de 8 plataformas en un solo panel en lugar de usar múltiples bots.' : 'Manage alerts from 8 platforms in one panel instead of using multiple bots.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-2xl border border-white/10 bg-[#1a1d34] p-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-pink-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-xl font-bold leading-tight text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="border-y border-white/10 py-12 sm:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-pink-200/70">
                {language === 'es' ? 'Inicio rápido' : 'Quick start'}
              </p>
              <h2 className="mt-2 text-center text-2xl font-bold text-white sm:text-3xl">
                {language === 'es' ? 'Empieza en minutos' : 'Get started in minutes'}
              </h2>
              <div className="mx-auto mt-10 grid max-w-6xl gap-8 md:grid-cols-3">
                {[
                  {
                    n: '1',
                    t: language === 'es' ? 'Invita a Moxi' : 'Invite Moxi',
                    d: language === 'es' ? 'Añade la bot a tu servidor de Discord con un clic.' : 'Add the bot to your Discord server with one click.',
                  },
                  {
                    n: '2',
                    t: language === 'es' ? 'Configura las alertas' : 'Configure alerts',
                    d: language === 'es' ? 'Abre el dashboard, elige una plataforma y selecciona el canal de notificaciones.' : 'Open the dashboard, choose a platform and select a notification channel.',
                  },
                  {
                    n: '3',
                    t: language === 'es' ? 'Mantente conectado' : 'Stay connected',
                    d: language === 'es' ? 'Tu comunidad recibe alertas con embeds automáticamente.' : 'Your community receives alerts with embeds automatically.',
                  },
                ].map((step) => (
                  <article key={step.n} className="text-center">
                    <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-200 text-base font-bold text-[#1a1d34]">
                      {step.n}
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                      {language === 'es' ? `Paso ${step.n}` : `Step ${step.n}`}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-white sm:text-xl">{step.t}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/65">{step.d}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="relative border-y border-white/10 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-5xl">
                <div className="mb-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  <span className="h-px flex-1 bg-white/10" />
                  {language === 'es' ? 'Relacionados' : 'Related'}
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
                  {language === 'es' ? 'Explora más módulos' : 'Explore more modules'}
                </h2>
              </div>

              <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    id: 'utilities',
                    label: language === 'es' ? 'Anime' : 'Anime',
                    desc: language === 'es' ? 'Alertas de episodios y contenido diario' : 'Episode alerts and daily content',
                    icon: CalendarHeart,
                  },
                  {
                    id: 'roleplay',
                    label: language === 'es' ? 'Comunidad' : 'Community',
                    desc: language === 'es' ? 'Herramientas de engagement para tu servidor' : 'Engagement tools for your server',
                    icon: Heart,
                  },
                  {
                    id: 'utilities',
                    label: language === 'es' ? 'Automatización' : 'Automation',
                    desc: language === 'es' ? 'Automatiza tareas repetitivas del servidor' : 'Automate repetitive server tasks',
                    icon: Zap,
                  },
                  {
                    id: 'ai',
                    label: language === 'es' ? 'IA' : 'AI',
                    desc: language === 'es' ? 'Funciones con inteligencia artificial' : 'Features powered by AI',
                    icon: Bot,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`${item.id}-${item.label}`}
                      to={`${getLocalizedPath(language, 'home')}/modules/${item.id}`}
                      className="rounded-2xl border border-white/10 bg-[#1a1d34] p-5 transition-all duration-200 hover:border-pink-300/25 hover:bg-[#202444]"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="mt-3 text-base font-semibold text-white">{item.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/65">{item.desc}</p>
                      <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-pink-300">
                        {language === 'es' ? 'Explorar' : 'Explore'}
                        <ArrowRight className="h-4 w-4" />
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 py-16">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {language === 'es' ? '¿Comenzamos nuestra historia?' : 'Shall we start our story?'}
              </h2>
              <Button
                className="mt-8 rounded-xl border border-pink-300/50 bg-transparent px-6 text-white hover:bg-pink-400/15"
                asChild
              >
                <a href="https://discord.com/oauth2/authorize?client_id=429457053791158281&permissions=399431429375&scope=bot%20applications.commands" target="_blank" rel="noopener noreferrer">
                  {language === 'es' ? 'Añadir a la bot' : 'Add bot'}
                </a>
              </Button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const relatedModules = [
    {
      to: `${homePath}/modules/social-alerts`,
      label: language === 'es' ? 'Alertas sociales' : 'Social alerts',
      description: language === 'es' ? 'Notifica directos, publicaciones y actividad externa.' : 'Notify lives, posts and external activity.',
      icon: CircleDot,
    },
    {
      to: `${homePath}/modules/ai`,
      label: language === 'es' ? 'IA' : 'AI',
      description: language === 'es' ? 'Asistentes y automatizaciones inteligentes.' : 'Assistants and smart automations.',
      icon: Sparkles,
    },
    {
      to: `${homePath}/modules/utilities`,
      label: language === 'es' ? 'Utilidades' : 'Utilities',
      description: language === 'es' ? 'Herramientas transversales para todo el servidor.' : 'Cross-server tools for daily management.',
      icon: Wrench,
    },
    {
      to: `${homePath}/resources/commands`,
      label: language === 'es' ? 'Comandos' : 'Commands',
      description: language === 'es' ? 'Consulta la base completa de acciones disponibles.' : 'Review the full base of available actions.',
      icon: BookOpen,
    },
  ];

  const moduleContent = (() => {
    switch (normalizedId) {
      case 'welcome':
        return {
          badge: language === 'es' ? 'Primer impacto' : 'First impression',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Mensajes que presentan tu servidor mejor' : 'Messages that present your server better',
          previewDescription: language === 'es' ? 'Activa flujos de bienvenida, despedida y onboarding sin perder consistencia visual.' : 'Enable welcome, farewell and onboarding flows without losing visual consistency.',
          previewStats: [
            { label: language === 'es' ? 'Canales' : 'Channels', value: language === 'es' ? 'Por evento' : 'Per event' },
            { label: language === 'es' ? 'Embeds' : 'Embeds', value: language === 'es' ? 'Personalizados' : 'Customized' },
            { label: language === 'es' ? 'Onboarding' : 'Onboarding', value: language === 'es' ? 'Más claro' : 'Clearer' },
          ],
          benefitsTitle: language === 'es' ? 'Haz que cada llegada importe' : 'Make every arrival matter',
          benefitsDescription: language === 'es' ? 'Mejora retención, contexto y orden desde el primer mensaje.' : 'Improve retention, context and order from the first message.',
          benefits: [
            { icon: Users, title: language === 'es' ? 'Recibimiento claro' : 'Clear welcome', text: language === 'es' ? 'Los nuevos miembros entienden el tono y los pasos iniciales.' : 'New members understand tone and first steps immediately.' },
            { icon: MessageSquareText, title: language === 'es' ? 'Mensajes editables' : 'Editable messages', text: language === 'es' ? 'Ajusta texto, embeds y llamadas a la acción con flexibilidad.' : 'Adjust text, embeds and calls to action flexibly.' },
            { icon: Shield, title: language === 'es' ? 'Más orden' : 'More order', text: language === 'es' ? 'Separa avisos, reglas y enlaces importantes desde el inicio.' : 'Separate notices, rules and important links from the start.' },
            { icon: Sparkles, title: language === 'es' ? 'Más identidad' : 'More identity', text: language === 'es' ? 'El servidor se siente cuidado desde la primera interacción.' : 'The server feels curated from the first interaction.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Elige canal' : 'Choose channel', text: language === 'es' ? 'Selecciona dónde aparecerán los mensajes de entrada.' : 'Select where entry messages should appear.' },
            { number: '2', title: language === 'es' ? 'Diseña el mensaje' : 'Design the message', text: language === 'es' ? 'Escribe el copy y estructura el embed.' : 'Write copy and structure the embed.' },
            { number: '3', title: language === 'es' ? 'Activa el flujo' : 'Activate the flow', text: language === 'es' ? 'Deja el onboarding listo para cada nuevo miembro.' : 'Leave onboarding ready for every new member.' },
          ],
        };
      case 'roleplay':
        return {
          badge: language === 'es' ? 'Historias vivas' : 'Living stories',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Organiza escenas, perfiles y relaciones' : 'Organize scenes, profiles and relationships',
          previewDescription: language === 'es' ? 'Crea una experiencia de rol coherente para comunidades activas y creativas.' : 'Create a coherent roleplay experience for active and creative communities.',
          previewStats: [
            { label: language === 'es' ? 'Perfiles' : 'Profiles', value: language === 'es' ? 'Más completos' : 'More complete' },
            { label: language === 'es' ? 'Escenas' : 'Scenes', value: language === 'es' ? 'Más claras' : 'Clearer' },
            { label: language === 'es' ? 'Lore' : 'Lore', value: language === 'es' ? 'Ordenado' : 'Organized' },
          ],
          benefitsTitle: language === 'es' ? 'Da estructura a tu comunidad creativa' : 'Give structure to your creative community',
          benefitsDescription: language === 'es' ? 'Haz que el rol tenga herramientas que acompañen la narrativa en vez de estorbarla.' : 'Give roleplay tools that support the narrative instead of blocking it.',
          benefits: [
            { icon: Heart, title: language === 'es' ? 'Más inmersión' : 'More immersion', text: language === 'es' ? 'Perfiles, relaciones y escenas con mejor continuidad.' : 'Profiles, relationships and scenes with better continuity.' },
            { icon: Users, title: language === 'es' ? 'Comunidad activa' : 'Active community', text: language === 'es' ? 'Facilita que más usuarios se sumen y participen.' : 'Make it easier for more users to join and participate.' },
            { icon: BookOpen, title: language === 'es' ? 'Lore centralizado' : 'Centralized lore', text: language === 'es' ? 'Evita que la información importante se pierda en chats.' : 'Prevent important information from getting lost in chats.' },
            { icon: Sparkles, title: language === 'es' ? 'Más consistencia' : 'More consistency', text: language === 'es' ? 'Cada dinámica mantiene una forma más clara y atractiva.' : 'Every dynamic keeps a clearer and more attractive form.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Configura perfiles' : 'Set up profiles', text: language === 'es' ? 'Define la base de fichas y datos de personaje.' : 'Define the base for character sheets and information.' },
            { number: '2', title: language === 'es' ? 'Ordena escenas' : 'Organize scenes', text: language === 'es' ? 'Agrupa canales y espacios por contexto narrativo.' : 'Group channels and spaces by narrative context.' },
            { number: '3', title: language === 'es' ? 'Activa dinámicas' : 'Enable dynamics', text: language === 'es' ? 'Deja listas las mecánicas que harán crecer el rol.' : 'Prepare the mechanics that will grow the roleplay.' },
          ],
        };
      case 'currency':
        return {
          badge: language === 'es' ? 'Economía viva' : 'Living economy',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Premia actividad con una economía clara' : 'Reward activity with a clear economy',
          previewDescription: language === 'es' ? 'Combina recompensas, tiendas y progresión para sostener el engagement.' : 'Combine rewards, shops and progression to sustain engagement.',
          previewStats: [
            { label: language === 'es' ? 'Monedas' : 'Coins', value: language === 'es' ? 'Configurables' : 'Configurable' },
            { label: language === 'es' ? 'Recompensas' : 'Rewards', value: language === 'es' ? 'Más claras' : 'Clearer' },
            { label: language === 'es' ? 'Progreso' : 'Progress', value: language === 'es' ? 'Visible' : 'Visible' },
          ],
          benefitsTitle: language === 'es' ? 'Convierte actividad en progreso tangible' : 'Turn activity into tangible progress',
          benefitsDescription: language === 'es' ? 'Una economía bien afinada mantiene el servidor vivo sin depender de spam.' : 'A well-tuned economy keeps the server alive without depending on spam.',
          benefits: [
            { icon: Coins, title: language === 'es' ? 'Recompensas reales' : 'Real rewards', text: language === 'es' ? 'Da valor a participar, hablar y completar acciones.' : 'Give value to participating, talking and completing actions.' },
            { icon: Gift, title: language === 'es' ? 'Tiendas y premios' : 'Shops and prizes', text: language === 'es' ? 'Transforma puntos en objetivos concretos para la comunidad.' : 'Turn points into concrete goals for the community.' },
            { icon: Users, title: language === 'es' ? 'Más retención' : 'More retention', text: language === 'es' ? 'Los usuarios vuelven porque sienten avance y logros.' : 'Users return because they feel progress and achievement.' },
            { icon: Zap, title: language === 'es' ? 'Más dinamismo' : 'More dynamism', text: language === 'es' ? 'La actividad del servidor se vuelve más constante.' : 'Server activity becomes more consistent.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Define la moneda' : 'Define the currency', text: language === 'es' ? 'Elige nombres, recompensas y reglas base.' : 'Choose names, rewards and base rules.' },
            { number: '2', title: language === 'es' ? 'Ajusta ganancias' : 'Tune earnings', text: language === 'es' ? 'Equilibra premios por actividad, juegos o misiones.' : 'Balance rewards for activity, games or quests.' },
            { number: '3', title: language === 'es' ? 'Activa el ciclo' : 'Activate the cycle', text: language === 'es' ? 'Conecta premios, tienda y objetivos de comunidad.' : 'Connect rewards, shop and community goals.' },
          ],
        };
      case 'utilities':
        return {
          badge: language === 'es' ? 'Caja de herramientas' : 'Toolbox',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Resuelve tareas diarias con menos pasos' : 'Solve daily tasks with fewer steps',
          previewDescription: language === 'es' ? 'Centraliza funciones prácticas que el servidor usa todos los días.' : 'Centralize practical functions your server uses every day.',
          previewStats: [
            { label: language === 'es' ? 'Atajos' : 'Shortcuts', value: language === 'es' ? 'Más rápidos' : 'Faster' },
            { label: language === 'es' ? 'Herramientas' : 'Tools', value: language === 'es' ? 'Todo en uno' : 'All in one' },
            { label: language === 'es' ? 'Gestión' : 'Management', value: language === 'es' ? 'Más simple' : 'Simpler' },
          ],
          benefitsTitle: language === 'es' ? 'Haz más con menos fricción' : 'Do more with less friction',
          benefitsDescription: language === 'es' ? 'Las utilidades bien agrupadas ahorran tiempo a admins y miembros.' : 'Well-grouped utilities save time for admins and members.',
          benefits: [
            { icon: Wrench, title: language === 'es' ? 'Todo centralizado' : 'Everything centralized', text: language === 'es' ? 'Evita repartir funciones básicas entre varios bots.' : 'Avoid spreading basic functions across multiple bots.' },
            { icon: Zap, title: language === 'es' ? 'Más velocidad' : 'More speed', text: language === 'es' ? 'Reduce pasos en acciones repetitivas del día a día.' : 'Reduce steps in repetitive everyday actions.' },
            { icon: Shield, title: language === 'es' ? 'Más control' : 'More control', text: language === 'es' ? 'Define usos y permisos con una lógica más clara.' : 'Define uses and permissions with clearer logic.' },
            { icon: Users, title: language === 'es' ? 'Más autonomía' : 'More autonomy', text: language === 'es' ? 'Los miembros resuelven más cosas sin depender de staff.' : 'Members solve more things without depending on staff.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Elige funciones' : 'Choose functions', text: language === 'es' ? 'Activa solo las herramientas que sí necesitas.' : 'Enable only the tools you truly need.' },
            { number: '2', title: language === 'es' ? 'Define permisos' : 'Define permissions', text: language === 'es' ? 'Controla quién puede usar qué dentro del servidor.' : 'Control who can use what inside the server.' },
            { number: '3', title: language === 'es' ? 'Integra al flujo' : 'Integrate it', text: language === 'es' ? 'Haz que formen parte natural del uso diario.' : 'Make them a natural part of daily server use.' },
          ],
        };
      case 'moderation':
        return {
          badge: language === 'es' ? 'Servidor bajo control' : 'Server under control',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Protege tu comunidad sin volverla rígida' : 'Protect your community without making it rigid',
          previewDescription: language === 'es' ? 'Modera con reglas, acciones y contexto desde una interfaz más clara.' : 'Moderate with rules, actions and context from a clearer interface.',
          previewStats: [
            { label: language === 'es' ? 'Seguridad' : 'Security', value: language === 'es' ? 'Más fuerte' : 'Stronger' },
            { label: language === 'es' ? 'Acciones' : 'Actions', value: language === 'es' ? 'Más rápidas' : 'Faster' },
            { label: language === 'es' ? 'Historial' : 'History', value: language === 'es' ? 'Con contexto' : 'With context' },
          ],
          benefitsTitle: language === 'es' ? 'Modera con más criterio y menos caos' : 'Moderate with more criteria and less chaos',
          benefitsDescription: language === 'es' ? 'Combina velocidad operativa con trazabilidad en un solo flujo.' : 'Combine operational speed with traceability in a single flow.',
          benefits: [
            { icon: Shield, title: language === 'es' ? 'Más seguridad' : 'More security', text: language === 'es' ? 'Actúa rápido ante spam, abuso o comportamientos nocivos.' : 'Act quickly against spam, abuse or harmful behavior.' },
            { icon: Users, title: language === 'es' ? 'Más salud comunitaria' : 'Healthier community', text: language === 'es' ? 'El orden mejora la convivencia y reduce fricción.' : 'Order improves coexistence and reduces friction.' },
            { icon: MessageSquareText, title: language === 'es' ? 'Contexto útil' : 'Useful context', text: language === 'es' ? 'Entiende mejor qué pasó antes de aplicar acciones.' : 'Understand better what happened before acting.' },
            { icon: Zap, title: language === 'es' ? 'Operación ágil' : 'Agile operation', text: language === 'es' ? 'Menos pasos entre detectar y resolver un problema.' : 'Fewer steps between detecting and solving a problem.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Configura reglas' : 'Configure rules', text: language === 'es' ? 'Define acciones automáticas y umbrales.' : 'Define automatic actions and thresholds.' },
            { number: '2', title: language === 'es' ? 'Revisa contexto' : 'Review context', text: language === 'es' ? 'Centraliza información para moderar mejor.' : 'Centralize information to moderate better.' },
            { number: '3', title: language === 'es' ? 'Actúa rápido' : 'Act fast', text: language === 'es' ? 'Mantén el servidor estable con menos carga manual.' : 'Keep the server stable with less manual load.' },
          ],
        };
      case 'ai':
        return {
          badge: language === 'es' ? 'Inteligencia aplicada' : 'Applied intelligence',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Automatiza respuestas y experiencias más inteligentes' : 'Automate responses and smarter experiences',
          previewDescription: language === 'es' ? 'Usa IA para asistencia, interacción y productividad dentro del servidor.' : 'Use AI for assistance, interaction and productivity inside the server.',
          previewStats: [
            { label: language === 'es' ? 'Asistencia' : 'Assistance', value: language === 'es' ? 'Más útil' : 'More useful' },
            { label: language === 'es' ? 'Flujos' : 'Flows', value: language === 'es' ? 'Automatizados' : 'Automated' },
            { label: language === 'es' ? 'Respuesta' : 'Response', value: language === 'es' ? 'Más rápida' : 'Faster' },
          ],
          benefitsTitle: language === 'es' ? 'Añade inteligencia sin romper la experiencia' : 'Add intelligence without breaking the experience',
          benefitsDescription: language === 'es' ? 'La IA debe servir al servidor, no complicarlo.' : 'AI should serve the server, not complicate it.',
          benefits: [
            { icon: Bot, title: language === 'es' ? 'Asistente real' : 'Real assistant', text: language === 'es' ? 'Ayuda a los miembros con respuestas útiles y rápidas.' : 'Help members with useful and fast responses.' },
            { icon: WandSparkles, title: language === 'es' ? 'Más automatización' : 'More automation', text: language === 'es' ? 'Reduce tareas manuales y repeticiones del staff.' : 'Reduce manual tasks and repeated staff work.' },
            { icon: Sparkles, title: language === 'es' ? 'Más valor' : 'More value', text: language === 'es' ? 'Convierte el bot en una herramienta más potente y memorable.' : 'Turn the bot into a stronger and more memorable tool.' },
            { icon: Shield, title: language === 'es' ? 'Uso controlado' : 'Controlled usage', text: language === 'es' ? 'Ajusta dónde, cómo y cuándo se activa.' : 'Adjust where, how and when it is enabled.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Define escenarios' : 'Define scenarios', text: language === 'es' ? 'Selecciona en qué puntos la IA aporta de verdad.' : 'Choose where AI truly adds value.' },
            { number: '2', title: language === 'es' ? 'Configura límites' : 'Set limits', text: language === 'es' ? 'Controla tono, permisos y alcance.' : 'Control tone, permissions and scope.' },
            { number: '3', title: language === 'es' ? 'Itera el uso' : 'Iterate usage', text: language === 'es' ? 'Ajusta el comportamiento según la respuesta de la comunidad.' : 'Adjust behavior based on community response.' },
          ],
        };
      case 'music':
        return {
          badge: language === 'es' ? 'Ritmo compartido' : 'Shared rhythm',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Lleva música a la voz con menos fricción' : 'Bring music to voice with less friction',
          previewDescription: language === 'es' ? 'Convierte canales de voz en espacios más activos con colas y control sencillo.' : 'Turn voice channels into more active spaces with queues and simple control.',
          previewStats: [
            { label: language === 'es' ? 'Colas' : 'Queues', value: language === 'es' ? 'Más claras' : 'Clearer' },
            { label: language === 'es' ? 'Sesiones' : 'Sessions', value: language === 'es' ? 'Más vivas' : 'More alive' },
            { label: language === 'es' ? 'Control' : 'Control', value: language === 'es' ? 'Sencillo' : 'Simple' },
          ],
          benefitsTitle: language === 'es' ? 'Haz que la voz tenga más vida' : 'Make voice channels feel more alive',
          benefitsDescription: language === 'es' ? 'Una experiencia musical cuidada mejora permanencia y convivencia.' : 'A curated music experience improves retention and community.',
          benefits: [
            { icon: Music4, title: language === 'es' ? 'Ambiente activo' : 'Active atmosphere', text: language === 'es' ? 'Los canales se vuelven más atractivos para quedarse.' : 'Channels become more attractive to stay in.' },
            { icon: Users, title: language === 'es' ? 'Experiencia compartida' : 'Shared experience', text: language === 'es' ? 'La música suma interacción y momentos de comunidad.' : 'Music adds interaction and community moments.' },
            { icon: Zap, title: language === 'es' ? 'Acceso rápido' : 'Quick access', text: language === 'es' ? 'Menos pasos entre pedir y escuchar.' : 'Fewer steps between requesting and listening.' },
            { icon: Shield, title: language === 'es' ? 'Control básico' : 'Basic control', text: language === 'es' ? 'Administra uso y orden de reproducción con facilidad.' : 'Manage usage and playback order easily.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Activa el módulo' : 'Enable the module', text: language === 'es' ? 'Prepara la experiencia musical para tus canales de voz.' : 'Prepare the music experience for your voice channels.' },
            { number: '2', title: language === 'es' ? 'Define la dinámica' : 'Define the dynamic', text: language === 'es' ? 'Ajusta cómo se suma la música a la comunidad.' : 'Adjust how music fits into the community.' },
            { number: '3', title: language === 'es' ? 'Mantén el flujo' : 'Keep the flow', text: language === 'es' ? 'Haz que la experiencia sea estable y sencilla de usar.' : 'Keep the experience stable and easy to use.' },
          ],
        };
      case 'giveaways':
        return {
          badge: language === 'es' ? 'Eventos y premios' : 'Events and rewards',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: language === 'es' ? 'Crea sorteos que eleven la participación' : 'Create giveaways that raise participation',
          previewDescription: language === 'es' ? 'Organiza eventos con mejor presentación y menos trabajo manual.' : 'Organize events with better presentation and less manual work.',
          previewStats: [
            { label: language === 'es' ? 'Eventos' : 'Events', value: language === 'es' ? 'Más visibles' : 'More visible' },
            { label: language === 'es' ? 'Participación' : 'Participation', value: language === 'es' ? 'Más alta' : 'Higher' },
            { label: language === 'es' ? 'Gestión' : 'Management', value: language === 'es' ? 'Más ligera' : 'Lighter' },
          ],
          benefitsTitle: language === 'es' ? 'Convierte premios en actividad real' : 'Turn prizes into real activity',
          benefitsDescription: language === 'es' ? 'Un buen sorteo mueve conversación, visibilidad y energía de comunidad.' : 'A good giveaway drives conversation, visibility and community energy.',
          benefits: [
            { icon: Gift, title: language === 'es' ? 'Más engagement' : 'More engagement', text: language === 'es' ? 'Los eventos impulsan participación y atención.' : 'Events boost participation and attention.' },
            { icon: Users, title: language === 'es' ? 'Más comunidad' : 'More community', text: language === 'es' ? 'Los sorteos ayudan a que más personas se involucren.' : 'Giveaways help more people get involved.' },
            { icon: Sparkles, title: language === 'es' ? 'Mejor presentación' : 'Better presentation', text: language === 'es' ? 'Los anuncios y resultados se sienten más cuidados.' : 'Announcements and results feel more curated.' },
            { icon: Shield, title: language === 'es' ? 'Menos caos' : 'Less chaos', text: language === 'es' ? 'Estructura reglas y ejecución con menos improvisación.' : 'Structure rules and execution with less improvisation.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Define el premio' : 'Define the prize', text: language === 'es' ? 'Crea un incentivo claro para participar.' : 'Create a clear incentive to participate.' },
            { number: '2', title: language === 'es' ? 'Lanza el evento' : 'Launch the event', text: language === 'es' ? 'Publica reglas, duración y dinámica.' : 'Publish rules, duration and participation flow.' },
            { number: '3', title: language === 'es' ? 'Cierra con claridad' : 'Close it clearly', text: language === 'es' ? 'Comunica el resultado sin fricción ni dudas.' : 'Communicate the result without friction or doubts.' },
          ],
        };
      default:
        return {
          badge: language === 'es' ? 'Módulo de Moxi' : 'Moxi module',
          previewEyebrow: language === 'es' ? 'Panel del módulo' : 'Module dashboard',
          previewTitle: title === titleKey ? prettyModuleName(normalizedId) : title,
          previewDescription: description === descriptionKey ? t('modulesShowcase.description') : description,
          previewStats: [
            { label: language === 'es' ? 'Setup' : 'Setup', value: language === 'es' ? 'Guiado' : 'Guided' },
            { label: language === 'es' ? 'Control' : 'Control', value: language === 'es' ? 'Centralizado' : 'Centralized' },
            { label: language === 'es' ? 'Resultado' : 'Outcome', value: language === 'es' ? 'Más claro' : 'Clearer' },
          ],
          benefitsTitle: language === 'es' ? 'Una experiencia más cuidada para este módulo' : 'A more polished experience for this module',
          benefitsDescription: language === 'es' ? 'Mismo lenguaje visual, mejor narrativa y configuración más clara.' : 'Same visual language, better storytelling and clearer setup.',
          benefits: [
            { icon: Sparkles, title: language === 'es' ? 'Más claridad' : 'More clarity', text: language === 'es' ? 'La información se presenta de forma más ordenada.' : 'Information is presented more clearly.' },
            { icon: Shield, title: language === 'es' ? 'Más control' : 'More control', text: language === 'es' ? 'La configuración se entiende mejor antes de activarla.' : 'Configuration is easier to understand before enabling it.' },
            { icon: Users, title: language === 'es' ? 'Más adopción' : 'More adoption', text: language === 'es' ? 'Una presentación mejorada facilita que se use de verdad.' : 'A better presentation makes actual adoption easier.' },
            { icon: Zap, title: language === 'es' ? 'Más velocidad' : 'More speed', text: language === 'es' ? 'Menos pasos entre descubrir y configurar.' : 'Fewer steps between discovery and setup.' },
          ],
          steps: [
            { number: '1', title: language === 'es' ? 'Explora' : 'Explore', text: language === 'es' ? 'Revisa qué aporta el módulo a tu servidor.' : 'Review what the module adds to your server.' },
            { number: '2', title: language === 'es' ? 'Configura' : 'Configure', text: language === 'es' ? 'Ajusta opciones y comportamiento principal.' : 'Adjust options and main behavior.' },
            { number: '3', title: language === 'es' ? 'Activa' : 'Enable', text: language === 'es' ? 'Deja listo el flujo final para tu comunidad.' : 'Leave the final flow ready for your community.' },
          ],
        };
    }
  })();

  return (
    <MarketingLanding
      badge={moduleContent.badge}
      title={title === titleKey ? prettyModuleName(normalizedId) : title}
      subtitle={description === descriptionKey ? t('modulesShowcase.description') : description}
      primaryAction={{ label: language === 'es' ? 'Invitar a la Bot' : 'Invite Bot', href: 'https://discord.com/oauth2/authorize?client_id=429457053791158281&permissions=399431429375&scope=bot%20applications.commands', external: true }}
      secondaryAction={{ label: language === 'es' ? 'Abrir Dashboard' : 'Open Dashboard', href: dashboardPath, variant: 'outline' }}
      previewEyebrow={moduleContent.previewEyebrow}
      previewTitle={moduleContent.previewTitle}
      previewDescription={moduleContent.previewDescription}
      previewStats={moduleContent.previewStats}
      benefitsLabel={language === 'es' ? 'Beneficios' : 'Benefits'}
      benefitsTitle={moduleContent.benefitsTitle}
      benefitsDescription={moduleContent.benefitsDescription}
      benefits={moduleContent.benefits}
      stepsLabel={language === 'es' ? 'Inicio rápido' : 'Quick start'}
      stepsTitle={language === 'es' ? 'Actívalo con un flujo más claro' : 'Enable it through a clearer flow'}
      steps={moduleContent.steps}
      relatedLabel={language === 'es' ? 'Relacionados' : 'Related'}
      relatedTitle={language === 'es' ? 'Explora más páginas del ecosistema Moxi' : 'Explore more pages from the Moxi ecosystem'}
      related={relatedModules}
      finalTitle={language === 'es' ? '¿Comenzamos nuestra historia?' : 'Shall we start our story?'}
      finalAction={{ label: language === 'es' ? 'Añadir a la bot' : 'Add bot', href: 'https://discord.com/oauth2/authorize?client_id=429457053791158281&permissions=399431429375&scope=bot%20applications.commands', external: true }}
    />
  );
}
