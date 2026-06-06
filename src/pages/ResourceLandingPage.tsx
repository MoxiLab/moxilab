import { useEffect, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BookOpen, Code2, GalleryVerticalEnd, LifeBuoy, Sparkles, Bot, Shield, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { MarketingLanding } from '@/components/MarketingLanding';
import { useI18n } from '@/lib/i18n';
import { getLocalizedPath } from '@/lib/routing';

type ResourceContent = {
  badge: string;
  title: string;
  subtitle: string;
  previewEyebrow: string;
  previewTitle: string;
  previewDescription: string;
  previewStats: Array<{ label: string; value: string }>;
  benefitsLabel: string;
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: Array<{ icon: typeof BookOpen; title: string; text: string }>;
  stepsLabel: string;
  stepsTitle: string;
  steps: Array<{ number: string; title: string; text: string }>;
  finalTitle: string;
  finalAction: { label: string; href: string; external?: boolean; variant?: 'default' | 'outline' };
  primaryAction: { label: string; href: string; external?: boolean; variant?: 'default' | 'outline' };
  secondaryAction: { label: string; href: string; external?: boolean; variant?: 'default' | 'outline' };
};

export function ResourceLandingPage() {
  const { resourceId } = useParams();
  const { language } = useI18n();
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef<string | undefined>(undefined);

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
  }, [setTheme, theme]);

  const homePath = getLocalizedPath(language, 'home');
  const dashboardPath = getLocalizedPath(language, 'dashboard');
  const commandsPath = getLocalizedPath(language, 'commands');
  const normalizedId = decodeURIComponent(resourceId ?? '').trim().toLowerCase();

  const content: Record<string, ResourceContent> = {
    wiki: {
      badge: language === 'es' ? 'Guia oficial' : 'Official guide',
      title: language === 'es' ? 'Wiki para administrar Moxi sin perder tiempo' : 'Wiki to manage Moxi without losing time',
      subtitle: language === 'es' ? 'Centraliza tutoriales, configuraciones y respuestas frecuentes en una experiencia más clara y moderna.' : 'Centralize tutorials, setups and frequent answers in a cleaner, more modern experience.',
      previewEyebrow: language === 'es' ? 'Vista previa' : 'Preview',
      previewTitle: language === 'es' ? 'Documentación ordenada por módulo' : 'Documentation organized by module',
      previewDescription: language === 'es' ? 'Encuentra guías rápidas, referencias y consejos prácticos para configurar Moxi más rápido.' : 'Find quick guides, references and practical tips to configure Moxi faster.',
      previewStats: [
        { label: language === 'es' ? 'Guias' : 'Guides', value: language === 'es' ? 'Paso a paso' : 'Step by step' },
        { label: language === 'es' ? 'Casos' : 'Use cases', value: language === 'es' ? 'Por módulo' : 'Per module' },
        { label: language === 'es' ? 'Ayuda' : 'Help', value: language === 'es' ? 'Siempre clara' : 'Always clear' },
      ],
      benefitsLabel: language === 'es' ? 'Beneficios' : 'Benefits',
      benefitsTitle: language === 'es' ? 'Todo lo importante, en un solo lugar' : 'Everything important, in one place',
      benefitsDescription: language === 'es' ? 'La wiki reduce dudas repetidas y acelera la configuración del servidor.' : 'The wiki reduces repeated doubts and speeds up server setup.',
      benefits: [
        { icon: BookOpen, title: language === 'es' ? 'Rutas claras' : 'Clear paths', text: language === 'es' ? 'Encuentra módulos, permisos y ajustes sin navegar a ciegas.' : 'Find modules, permissions and settings without wandering blindly.' },
        { icon: Code2, title: language === 'es' ? 'Ejemplos útiles' : 'Useful examples', text: language === 'es' ? 'Cada guía aterriza la configuración en pasos reales.' : 'Each guide turns setup into real steps.' },
        { icon: Shield, title: language === 'es' ? 'Menos errores' : 'Fewer mistakes', text: language === 'es' ? 'Evita configuraciones incompletas o contradictorias.' : 'Avoid incomplete or contradictory setups.' },
        { icon: Sparkles, title: language === 'es' ? 'Actualizada' : 'Updated', text: language === 'es' ? 'Una base viva para nuevas funciones y cambios.' : 'A living base for new features and changes.' },
      ],
      stepsLabel: language === 'es' ? 'Flujo' : 'Flow',
      stepsTitle: language === 'es' ? 'Encuentra respuestas en minutos' : 'Find answers in minutes',
      steps: [
        { number: '1', title: language === 'es' ? 'Abre la guía' : 'Open the guide', text: language === 'es' ? 'Elige el módulo o sistema que quieres configurar.' : 'Choose the module or system you want to configure.' },
        { number: '2', title: language === 'es' ? 'Sigue los pasos' : 'Follow the steps', text: language === 'es' ? 'Aplica la configuración desde Discord y el dashboard.' : 'Apply the setup from Discord and the dashboard.' },
        { number: '3', title: language === 'es' ? 'Ajusta detalles' : 'Tune details', text: language === 'es' ? 'Personaliza canales, mensajes y comportamiento final.' : 'Customize channels, messages and final behavior.' },
      ],
      primaryAction: { label: language === 'es' ? 'Abrir comandos' : 'Open commands', href: commandsPath },
      secondaryAction: { label: language === 'es' ? 'Abrir dashboard' : 'Open dashboard', href: dashboardPath, variant: 'outline' },
      finalTitle: language === 'es' ? 'Empieza a documentar mejor tu servidor' : 'Start documenting your server better',
      finalAction: { label: language === 'es' ? 'Ir a comandos' : 'Go to commands', href: commandsPath },
    },
    commands: {
      badge: language === 'es' ? 'Base de comandos' : 'Command base',
      title: language === 'es' ? 'Explora todos los comandos con la misma estética de la landing' : 'Explore every command with the same landing style',
      subtitle: language === 'es' ? 'Consulta categorías, ejemplos y atajos antes de entrar a la lista completa de comandos.' : 'Review categories, examples and shortcuts before opening the full command list.',
      previewEyebrow: language === 'es' ? 'Catálogo' : 'Catalog',
      previewTitle: language === 'es' ? 'Mapa rápido de capacidades' : 'Quick capability map',
      previewDescription: language === 'es' ? 'Comandos prefix y slash ordenados para encontrar más rápido lo que necesitas.' : 'Prefix and slash commands organized so you can find what you need faster.',
      previewStats: [
        { label: language === 'es' ? 'Busqueda' : 'Search', value: language === 'es' ? 'Instantánea' : 'Instant' },
        { label: language === 'es' ? 'Filtros' : 'Filters', value: language === 'es' ? 'Por categoría' : 'By category' },
        { label: language === 'es' ? 'Cobertura' : 'Coverage', value: language === 'es' ? 'Prefix y slash' : 'Prefix and slash' },
      ],
      benefitsLabel: language === 'es' ? 'Ventajas' : 'Advantages',
      benefitsTitle: language === 'es' ? 'Navega mejor antes de ejecutar' : 'Navigate better before you execute',
      benefitsDescription: language === 'es' ? 'La documentación visual reduce la fricción cuando el servidor crece.' : 'Visual documentation reduces friction as your server grows.',
      benefits: [
        { icon: Code2, title: language === 'es' ? 'Referencia rápida' : 'Quick reference', text: language === 'es' ? 'Consulta nombres, usos y ejemplos sin buscar a ciegas.' : 'Check names, usage and examples without blind searching.' },
        { icon: Sparkles, title: language === 'es' ? 'Mejor onboarding' : 'Better onboarding', text: language === 'es' ? 'Los moderadores nuevos entienden antes el sistema.' : 'New moderators understand the system faster.' },
        { icon: Bot, title: language === 'es' ? 'Menos prueba y error' : 'Less trial and error', text: language === 'es' ? 'El contexto evita configuraciones equivocadas.' : 'Context helps avoid wrong setups.' },
        { icon: Shield, title: language === 'es' ? 'Más control' : 'More control', text: language === 'es' ? 'Filtra por tipo y encuentra justo el comando correcto.' : 'Filter by type and find the right command quickly.' },
      ],
      stepsLabel: language === 'es' ? 'Uso' : 'Usage',
      stepsTitle: language === 'es' ? 'Del descubrimiento a la ejecución' : 'From discovery to execution',
      steps: [
        { number: '1', title: language === 'es' ? 'Explora' : 'Explore', text: language === 'es' ? 'Revisa áreas y categorías principales.' : 'Review main areas and categories.' },
        { number: '2', title: language === 'es' ? 'Filtra' : 'Filter', text: language === 'es' ? 'Encuentra el comando exacto por nombre o módulo.' : 'Find the exact command by name or module.' },
        { number: '3', title: language === 'es' ? 'Ejecuta' : 'Execute', text: language === 'es' ? 'Llévalo a Discord con una idea clara del resultado.' : 'Take it to Discord with a clear sense of the result.' },
      ],
      primaryAction: { label: language === 'es' ? 'Ver lista de comandos' : 'See command list', href: commandsPath },
      secondaryAction: { label: language === 'es' ? 'Abrir dashboard' : 'Open dashboard', href: dashboardPath, variant: 'outline' },
      finalTitle: language === 'es' ? 'Pasa a la lista completa cuando quieras' : 'Jump to the full list whenever you want',
      finalAction: { label: language === 'es' ? 'Abrir comandos' : 'Open commands', href: commandsPath },
    },
    gallery: {
      badge: language === 'es' ? 'Galería visual' : 'Visual gallery',
      title: language === 'es' ? 'Descubre cómo luce Moxi en acción' : 'Discover how Moxi looks in action',
      subtitle: language === 'es' ? 'Una vista más editorial para enseñar módulos, embeds y configuraciones reales.' : 'A more editorial view to showcase modules, embeds and real setups.',
      previewEyebrow: language === 'es' ? 'Muestras' : 'Showcase',
      previewTitle: language === 'es' ? 'Capturas que venden mejor el producto' : 'Screens that sell the product better',
      previewDescription: language === 'es' ? 'Presenta comandos, paneles y resultados con una narrativa visual coherente.' : 'Present commands, dashboards and results with a coherent visual narrative.',
      previewStats: [
        { label: language === 'es' ? 'Embeds' : 'Embeds', value: language === 'es' ? 'Con contexto' : 'With context' },
        { label: language === 'es' ? 'Módulos' : 'Modules', value: language === 'es' ? 'Bien explicados' : 'Well explained' },
        { label: language === 'es' ? 'Marca' : 'Brand', value: language === 'es' ? 'Más sólida' : 'Stronger' },
      ],
      benefitsLabel: language === 'es' ? 'Resultados' : 'Results',
      benefitsTitle: language === 'es' ? 'Convierte funciones en demostraciones' : 'Turn features into demonstrations',
      benefitsDescription: language === 'es' ? 'La galería ayuda a entender el valor del bot antes de configurarlo.' : 'The gallery helps users understand the bot value before configuring it.',
      benefits: [
        { icon: GalleryVerticalEnd, title: language === 'es' ? 'Más claridad' : 'More clarity', text: language === 'es' ? 'Las capturas muestran el producto sin explicaciones largas.' : 'Screens show the product without long explanations.' },
        { icon: Bell, title: language === 'es' ? 'Mejor contexto' : 'Better context', text: language === 'es' ? 'Cada pieza visual aterriza una función concreta.' : 'Each visual piece lands a concrete feature.' },
        { icon: Sparkles, title: language === 'es' ? 'Más impacto' : 'More impact', text: language === 'es' ? 'Una presentación más cuidada mejora la percepción del proyecto.' : 'A more curated presentation improves project perception.' },
        { icon: Bot, title: language === 'es' ? 'Más adopción' : 'More adoption', text: language === 'es' ? 'Es más fácil probar un módulo cuando ya se vio funcionando.' : 'It is easier to try a module after seeing it in action.' },
      ],
      stepsLabel: language === 'es' ? 'Recorrido' : 'Walkthrough',
      stepsTitle: language === 'es' ? 'Usa la galería como vitrina' : 'Use the gallery as a showcase',
      steps: [
        { number: '1', title: language === 'es' ? 'Explora vistas' : 'Explore views', text: language === 'es' ? 'Revisa ejemplos de embeds, paneles y respuestas.' : 'Review embed, dashboard and response examples.' },
        { number: '2', title: language === 'es' ? 'Relaciona módulos' : 'Relate modules', text: language === 'es' ? 'Conecta cada captura con el módulo que la produce.' : 'Connect each screen with the module that produces it.' },
        { number: '3', title: language === 'es' ? 'Decide tu setup' : 'Decide your setup', text: language === 'es' ? 'Elige qué experiencia quieres activar en tu servidor.' : 'Choose the experience you want to activate on your server.' },
      ],
      primaryAction: { label: language === 'es' ? 'Ver módulos' : 'See modules', href: `${homePath}#modules` },
      secondaryAction: { label: language === 'es' ? 'Abrir dashboard' : 'Open dashboard', href: dashboardPath, variant: 'outline' },
      finalTitle: language === 'es' ? 'Pasa de la inspiración a la configuración' : 'Move from inspiration to configuration',
      finalAction: { label: language === 'es' ? 'Abrir dashboard' : 'Open dashboard', href: dashboardPath },
    },
    support: {
      badge: language === 'es' ? 'Ayuda directa' : 'Direct help',
      title: language === 'es' ? 'Soporte con el mismo lenguaje visual del producto' : 'Support with the same visual language as the product',
      subtitle: language === 'es' ? 'Centraliza ayuda, diagnóstico y resolución con una página de entrada más clara.' : 'Centralize help, diagnostics and resolution with a clearer entry page.',
      previewEyebrow: language === 'es' ? 'Soporte' : 'Support',
      previewTitle: language === 'es' ? 'Ayuda rápida y mejor orientada' : 'Faster, better-directed help',
      previewDescription: language === 'es' ? 'Reduce el tiempo entre el problema, la guía correcta y la solución final.' : 'Reduce the time between the problem, the right guide and the final solution.',
      previewStats: [
        { label: language === 'es' ? 'Dudas' : 'Questions', value: language === 'es' ? 'Más claras' : 'Clearer' },
        { label: language === 'es' ? 'Soporte' : 'Support', value: language === 'es' ? 'Más rápido' : 'Faster' },
        { label: language === 'es' ? 'Diagnóstico' : 'Diagnostics', value: language === 'es' ? 'Mejor guiado' : 'Better guided' },
      ],
      benefitsLabel: language === 'es' ? 'Valor' : 'Value',
      benefitsTitle: language === 'es' ? 'Canaliza mejor la ayuda' : 'Channel help better',
      benefitsDescription: language === 'es' ? 'Un punto de entrada más claro reduce ruido y mejora el soporte.' : 'A clearer entry point reduces noise and improves support.',
      benefits: [
        { icon: LifeBuoy, title: language === 'es' ? 'Menos fricción' : 'Less friction', text: language === 'es' ? 'Los usuarios entienden dónde empezar antes de preguntar.' : 'Users know where to start before asking.' },
        { icon: BookOpen, title: language === 'es' ? 'Más autoservicio' : 'More self-service', text: language === 'es' ? 'La documentación y el soporte se complementan mejor.' : 'Documentation and support complement each other better.' },
        { icon: Shield, title: language === 'es' ? 'Incidencias ordenadas' : 'Ordered incidents', text: language === 'es' ? 'Es más fácil separar dudas, errores y sugerencias.' : 'It is easier to separate doubts, bugs and suggestions.' },
        { icon: Sparkles, title: language === 'es' ? 'Imagen sólida' : 'Stronger image', text: language === 'es' ? 'El soporte también comunica calidad del producto.' : 'Support also communicates product quality.' },
      ],
      stepsLabel: language === 'es' ? 'Proceso' : 'Process',
      stepsTitle: language === 'es' ? 'Busca ayuda con menos vueltas' : 'Get help with fewer loops',
      steps: [
        { number: '1', title: language === 'es' ? 'Detecta el problema' : 'Detect the issue', text: language === 'es' ? 'Identifica si es configuración, permisos o uso.' : 'Identify whether it is configuration, permissions or usage.' },
        { number: '2', title: language === 'es' ? 'Consulta la base' : 'Check the base', text: language === 'es' ? 'Revisa comandos, wiki o el módulo implicado.' : 'Review commands, wiki or the involved module.' },
        { number: '3', title: language === 'es' ? 'Escala soporte' : 'Escalate support', text: language === 'es' ? 'Cuando haga falta, pasa al equipo con más contexto.' : 'When needed, escalate to the team with more context.' },
      ],
      primaryAction: { label: language === 'es' ? 'Abrir wiki' : 'Open wiki', href: `${homePath}/resources/wiki` },
      secondaryAction: { label: language === 'es' ? 'Abrir dashboard' : 'Open dashboard', href: dashboardPath, variant: 'outline' },
      finalTitle: language === 'es' ? 'Empieza por la ruta de ayuda correcta' : 'Start with the right help path',
      finalAction: { label: language === 'es' ? 'Ir a la wiki' : 'Go to wiki', href: `${homePath}/resources/wiki` },
    },
  };

  const current = content[normalizedId];

  if (!current) {
    return <Navigate to={homePath} replace />;
  }

  const related = [
    {
      to: `${homePath}/modules/social-alerts`,
      label: language === 'es' ? 'Alertas sociales' : 'Social alerts',
      description: language === 'es' ? 'Conecta plataformas y notifica en Discord.' : 'Connect platforms and notify inside Discord.',
      icon: Bell,
    },
    {
      to: `${homePath}/modules/ai`,
      label: language === 'es' ? 'Inteligencia artificial' : 'Artificial intelligence',
      description: language === 'es' ? 'Automatiza respuestas y experiencias inteligentes.' : 'Automate responses and smarter experiences.',
      icon: Bot,
    },
    {
      to: `${homePath}/modules/moderation`,
      label: language === 'es' ? 'Moderación' : 'Moderation',
      description: language === 'es' ? 'Mantén el servidor controlado y saludable.' : 'Keep your server controlled and healthy.',
      icon: Shield,
    },
    {
      to: `${homePath}/resources/commands`,
      label: language === 'es' ? 'Comandos' : 'Commands',
      description: language === 'es' ? 'Consulta todo lo que puede hacer Moxi.' : 'Review everything Moxi can do.',
      icon: Code2,
    },
  ];

  return (
    <MarketingLanding
      badge={current.badge}
      title={current.title}
      subtitle={current.subtitle}
      primaryAction={current.primaryAction}
      secondaryAction={current.secondaryAction}
      previewEyebrow={current.previewEyebrow}
      previewTitle={current.previewTitle}
      previewDescription={current.previewDescription}
      previewStats={current.previewStats}
      benefitsLabel={current.benefitsLabel}
      benefitsTitle={current.benefitsTitle}
      benefitsDescription={current.benefitsDescription}
      benefits={current.benefits}
      stepsLabel={current.stepsLabel}
      stepsTitle={current.stepsTitle}
      steps={current.steps}
      relatedLabel={language === 'es' ? 'Relacionados' : 'Related'}
      relatedTitle={language === 'es' ? 'Descubre más páginas de Moxi' : 'Discover more Moxi pages'}
      related={related}
      finalTitle={current.finalTitle}
      finalAction={current.finalAction}
    />
  );
}