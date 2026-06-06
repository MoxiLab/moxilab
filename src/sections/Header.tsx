import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { ChevronDown, Sun, Moon, Crown, User, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n, type Language } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';

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
  const { language, setLanguage, t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loginHref = (() => {
    const customUrl = (import.meta.env.VITE_LOGIN_URL || '').trim();
    if (customUrl) return customUrl;

    const clientId = (import.meta.env.VITE_DISCORD_CLIENT_ID || '').trim();
    if (!clientId) return 'https://discord.com/login';

    const fallbackOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const redirectUri =
      (import.meta.env.VITE_DISCORD_REDIRECT_URI || '').trim() || `${fallbackOrigin}/dashboard`;
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

  const modules = [
    { name: t('header.modules.welcome'), href: '#' },
    { name: t('header.modules.roleplay'), href: '#' },
    { name: t('header.modules.currency'), href: '#' },
    { name: t('header.modules.utilities'), href: '#' },
    { name: t('header.modules.moderation'), href: '#' },
  ];

  const resources = [
    { name: t('header.resources.documentation'), href: '#' },
    { name: t('header.resources.commands'), href: '/commands' },
    { name: t('header.resources.gallery'), href: '#' },
    { name: t('header.resources.support'), href: '#' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <a href="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl overflow-hidden">
              <img
                src="/moxi-hero.jpg"
                alt="Moxi"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-2xl text-foreground">Moxi</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            <a
              href="/commands"
              className="px-5 py-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {t('header.nav.commands')}
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-5 py-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                  {t('header.nav.modules')}
                  <ChevronDown className="w-6 h-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                {modules.map((module) => (
                  <DropdownMenuItem key={module.name} asChild>
                    <a href={module.href} className="cursor-pointer">
                      {module.name}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-5 py-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                  {t('header.nav.resources')}
                  <ChevronDown className="w-6 h-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                {resources.map((resource) => (
                  <DropdownMenuItem key={resource.name} asChild>
                    <a href={resource.href} className="cursor-pointer">
                      {resource.name}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                  <img
                    src={activeLanguage.flagSrc}
                    alt={activeLanguage.flagAlt}
                    className="w-6 h-6"
                  />
                  <span>{activeLanguage.short}</span>
                  <ChevronDown className="w-6 h-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as Language)}>
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
              className="p-3 text-foreground/80 hover:text-primary transition-colors"
              aria-label={isDark ? t('header.theme.light') : t('header.theme.dark')}
            >
              {isDark ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
            </button>

            <Button
              variant="outline"
              className="gap-2 border-amber-400 text-amber-600 hover:bg-amber-50 px-5 py-3 text-lg"
            >
              <Crown className="w-6 h-6" />
              {t('common.premium')}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/8 transition-colors">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/40">
                      {user.avatar ? (
                        <img
                          src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                          alt={user.globalName ?? user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/60 flex items-center justify-center text-sm font-bold text-white">
                          {(user.globalName ?? user.username)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-28 truncate">
                      {user.globalName ?? user.username}
                    </span>
                    <ChevronDown className="w-4 h-4 text-foreground/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="gap-2 cursor-pointer">
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
            className="md:hidden p-3 text-foreground/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border py-4"
          >
            <nav className="flex flex-col gap-2">
              <a href="/commands" className="px-4 py-2.5 text-lg text-foreground/80 hover:text-primary">
                {t('header.nav.commands')}
              </a>
              <a href="#" className="px-4 py-2.5 text-lg text-foreground/80 hover:text-primary">
                {t('header.nav.modules')}
              </a>
              <a href="#" className="px-4 py-2.5 text-lg text-foreground/80 hover:text-primary">
                {t('header.nav.resources')}
              </a>
              <div className="border-t border-border pt-2 mt-2">
                {user ? (
                  <div className="flex flex-col gap-2 px-4">
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                      className="flex items-center gap-2 py-2.5 text-lg text-foreground/80 hover:text-primary"
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
