import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Sun, Moon, Crown, User, Menu, X, LayoutDashboard, LogOut, Bell, Shield, Sparkles, Wrench, Music2, Bot, Gift, Heart, BookOpen, Code2, Images, LifeBuoy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n, type Language } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';
import { getLocalizedPath, localizePathname, getLanguageFromPathname } from '@/lib/routing';

const languages = [
  {
    id: 'en',
    label: 'English',
    short: 'EN',
    flagSrc: 'https://twemoji.maxcdn.com/v/latest/svg/1f1fa-1f1f8.svg',
    flagAlt: 'English (US)',
  },
  {
    id: 'es',
    label: 'Espanol',
    short: 'ES',
    flagSrc: 'https://twemoji.maxcdn.com/v/latest/svg/1f1ea-1f1f8.svg',
    flagAlt: 'Espanol',
  },
  {
    id: 'zh',
    label: '中文',
    short: 'ZH',
    flagSrc: 'https://twemoji.maxcdn.com/v/latest/svg/1f1e8-1f1f3.svg',
    flagAlt: '中文',
  },
  {
    id: 'ja',
    label: '日本語',
    short: 'JA',
    flagSrc: 'https://twemoji.maxcdn.com/v/latest/svg/1f1ef-1f1f5.svg',
    flagAlt: '日本語',
  },
  {
    id: 'ko',
    label: '한국어',
    short: 'KR',
    flagSrc: 'https://twemoji.maxcdn.com/v/latest/svg/1f1f0-1f1f7.svg',
    flagAlt: '한국어',
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesMenuOpen, setModulesMenuOpen] = useState(false);
  const [resourcesMenuOpen, setResourcesMenuOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout, profileAvatarUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLanguage = getLanguageFromPathname(location.pathname) ?? language;
  const loginHref = (() => {
    const customUrl = (import.meta.env.VITE_LOGIN_URL || '').trim();
    if (customUrl) return customUrl;

    const clientId = (import.meta.env.VITE_DISCORD_CLIENT_ID || '').trim();
    if (!clientId) return 'https://discord.com/login';

    const fallbackOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const redirectUri =
      (import.meta.env.VITE_DISCORD_REDIRECT_URI || '').trim() ||
      `${fallbackOrigin}${getLocalizedPath(currentLanguage, 'dashboard')}`;
    const scopes =
      (import.meta.env.VITE_DISCORD_SCOPES || '').trim() || 'identify guilds';

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      prompt: 'consent',
    });

    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  })();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const activeLanguage = languages.find((item) => item.id === language) ?? languages[0];
  const goToLocalizedRoute = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    navigate(localizePathname(location.pathname, nextLanguage), { replace: true });
  };

  const moduleGroups = [
    {
      icon: Bell,
      title: language === 'es' ? 'Alertas Sociales' : t('server.modules.streaming.name'),
      description:
        language === 'es'
          ? 'Conecta Twitch, YouTube, Kick, TikTok, Instagram, X, Bluesky y Reddit en un solo flujo.'
          : t('server.modules.streaming.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/social-alerts`,
    },
    {
      icon: Heart,
      title: t('modulesShowcase.modules.roleplay.title'),
      description: t('modulesShowcase.modules.roleplay.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/roleplay`,
    },
    {
      icon: Bot,
      title: t('modulesShowcase.modules.economy.title'),
      description: t('modulesShowcase.modules.economy.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/currency`,
    },
    {
      icon: Wrench,
      title: t('modulesShowcase.modules.utilities.title'),
      description: t('modulesShowcase.modules.utilities.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/utilities`,
    },
    {
      icon: Shield,
      title: t('modulesShowcase.modules.moderation.title'),
      description: t('modulesShowcase.modules.moderation.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/moderation`,
    },
    {
      icon: Sparkles,
      title: t('modulesShowcase.modules.ai.title'),
      description: t('modulesShowcase.modules.ai.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/ai`,
    },
    {
      icon: Music2,
      title: t('modulesShowcase.modules.music.title'),
      description: t('modulesShowcase.modules.music.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/music`,
    },
    {
      icon: Gift,
      title: t('modulesShowcase.modules.giveaways.title'),
      description: t('modulesShowcase.modules.giveaways.description'),
      href: `${getLocalizedPath(language, 'home')}/modules/giveaways`,
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: t('footer.links.wiki'),
      description: t('resourcesMenu.wiki'),
      href: `${getLocalizedPath(language, 'home')}/resources/wiki`,
    },
    {
      icon: Code2,
      title: t('header.resources.commands'),
      description: t('resourcesMenu.commands'),
      href: `${getLocalizedPath(language, 'home')}/resources/commands`,
    },
    {
      icon: Images,
      title: t('footer.links.gallery'),
      description: t('resourcesMenu.gallery'),
      href: `${getLocalizedPath(language, 'home')}/resources/gallery`,
    },
    {
      icon: LifeBuoy,
      title: t('footer.links.supportServer'),
      description: t('resourcesMenu.support'),
      href: `${getLocalizedPath(language, 'home')}/resources/support`,
    },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sk-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'sk-nav-scrolled'
          : 'sk-nav-top'
      }`}
    >
      <div className="sk-nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">
          {/* Logo */}
          <Link to={getLocalizedPath(language, 'home')} className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-1 ring-border/40 shadow-sm">
              <img
                src="/moxi-hero.jpg"
                alt="Moxi"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl sm:text-2xl text-foreground tracking-tight">Moxi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to={getLocalizedPath(language, 'commands')}
              className="sk-nav-link rounded-full px-4 py-2.5 text-base font-medium transition-colors"
            >
              {t('header.nav.commands')}
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setModulesMenuOpen(true)}
              onMouseLeave={() => setModulesMenuOpen(false)}
            >
              <button className="sk-nav-link flex items-center gap-1.5 rounded-full px-4 py-2.5 text-base font-medium transition-colors">
                {t('header.nav.modules')}
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {modulesMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, clipPath: 'inset(0 0 100% 0 round 24px)' }}
                    animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 24px)' }}
                    exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0 round 24px)' }}
                    transition={{ duration: 0.28, ease: [0.2, 1, 0.22, 1] }}
                    className="absolute left-0 top-full z-50 pt-3"
                  >
                    <div className="sk-nav-mega w-[560px] rounded-[1.5rem] p-3 backdrop-blur-md">
                      <div className="grid grid-cols-2 gap-2">
                        {moduleGroups.map((module) => {
                          const Icon = module.icon;

                          return (
                            <Link key={module.title} to={module.href} onClick={() => setModulesMenuOpen(false)} className="sk-nav-mega-item flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors">
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-foreground/20 bg-background/70 text-foreground/80">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-foreground">{module.title}</span>
                                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                                  {module.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setResourcesMenuOpen(true)}
              onMouseLeave={() => setResourcesMenuOpen(false)}
            >
              <button className="sk-nav-link flex items-center gap-1.5 rounded-full px-4 py-2.5 text-base font-medium transition-colors">
                {t('header.nav.resources')}
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {resourcesMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, clipPath: 'inset(0 0 100% 0 round 24px)' }}
                    animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 24px)' }}
                    exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0 round 24px)' }}
                    transition={{ duration: 0.28, ease: [0.2, 1, 0.22, 1] }}
                    className="absolute left-0 top-full z-50 pt-3"
                  >
                    <div className="sk-nav-mega w-[560px] rounded-[1.5rem] p-3 backdrop-blur-md">
                      <div className="grid grid-cols-2 gap-2">
                        {resources.map((resource) => {
                          const Icon = resource.icon;

                          return (
                            <Link key={resource.title} to={resource.href} onClick={() => setResourcesMenuOpen(false)} className="sk-nav-mega-item flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors">
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-foreground/20 bg-background/70 text-foreground/80">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-foreground">{resource.title}</span>
                                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                                  {resource.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="sk-nav-link flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors">
                  <img
                    src={activeLanguage.flagSrc}
                    alt={activeLanguage.flagAlt}
                    className="w-5 h-5"
                  />
                  <span>{activeLanguage.short}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={language} onValueChange={(value) => goToLocalizedRoute(value as Language)}>
                  {languages.map((language) => (
                    <DropdownMenuRadioItem key={language.id} value={language.id}>
                      <span className="inline-flex items-center gap-2">
                        <img
                          src={language.flagSrc}
                          alt={language.flagAlt}
                          className="w-5 h-5"
                        />
                        {language.label}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="sk-nav-icon-btn flex h-11 w-11 items-center justify-center rounded-full transition-colors"
              aria-label={isDark ? t('header.theme.light') : t('header.theme.dark')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Button
              variant="outline"
              className="sk-nav-premium h-11 gap-2 rounded-full px-4 text-sm font-semibold"
              asChild
            >
              <Link to={getLocalizedPath(language, 'premium')}>
                <Crown className="w-4 h-4" />
                {t('common.premium')}
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="sk-nav-user flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/30">
                      {profileAvatarUrl || user.avatar ? (
                        <img
                          src={profileAvatarUrl ?? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                          alt={user.globalName ?? user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/60 flex items-center justify-center text-sm font-bold text-white">
                          {(user.globalName ?? user.username)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-24 truncate">
                      {user.globalName ?? user.username}
                    </span>
                    <ChevronDown className="w-4 h-4 text-foreground/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(getLocalizedPath(language, 'dashboard'))} className="gap-2 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4" />
                    Mi panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" className="gap-2 px-5 py-3 text-lg" asChild>
                <a href={loginHref}>
                  <User className="w-6 h-6" />
                  {t('common.login')}
                </a>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sk-nav-icon-btn md:hidden flex h-11 w-11 items-center justify-center rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sk-nav-mobile md:hidden py-4"
          >
            <nav className="flex flex-col gap-2">
              <a href={getLocalizedPath(language, 'commands')} className="sk-nav-mobile-link px-4 py-2.5 text-lg">
                {t('header.nav.commands')}
              </a>
              <a href="#" className="sk-nav-mobile-link px-4 py-2.5 text-lg">
                {t('header.nav.modules')}
              </a>
              <a href="#" className="sk-nav-mobile-link px-4 py-2.5 text-lg">
                {t('header.nav.resources')}
              </a>
              <div className="border-t border-border/50 pt-2 mt-2">
                {user ? (
                  <div className="flex flex-col gap-2 px-4">
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate(getLocalizedPath(language, 'dashboard')); }}
                      className="sk-nav-mobile-link flex items-center gap-2 py-2.5 text-lg"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Mi panel
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="flex items-center gap-2 py-2.5 text-lg text-destructive/80 hover:text-destructive"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <Button className="w-full gap-2 bg-pink-500 hover:bg-pink-600 text-lg py-3" asChild>
                    <a href={loginHref}>
                      <User className="w-6 h-6" />
                      {t('common.login')}
                    </a>
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
