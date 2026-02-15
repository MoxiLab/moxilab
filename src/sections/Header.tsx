import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Sun, Moon, Crown, User, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

const modules = [
  { name: 'Welcome', href: '#' },
  { name: 'Roleplay', href: '#' },
  { name: 'Currency', href: '#' },
  { name: 'Utilities', href: '#' },
  { name: 'Moderation', href: '#' },
];

const resources = [
  { name: 'Documentation', href: '#' },
  { name: 'Commands', href: '#/commands' },
  { name: 'Gallery', href: '#' },
  { name: 'Support', href: '#' },
];

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
    label: 'Español',
    short: 'ES',
    flagSrc: 'https://twemoji.maxcdn.com/v/latest/svg/1f1ea-1f1f8.svg',
    flagAlt: 'Español',
  },
  {
    id: 'pt',
    label: 'Português',
    short: 'PT',
    flagSrc: 'https://twemoji.maxcdn.com/v/latest/svg/1f1e7-1f1f7.svg',
    flagAlt: 'Português (BR)',
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageId, setLanguageId] = useState('en');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const activeLanguage = languages.find((language) => language.id === languageId) ?? languages[0];

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
              href="#/commands"
              className="px-5 py-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Commands
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-5 py-3 text-lg font-medium text-foreground/80 hover:text-primary transition-colors">
                  Modules
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
                  Resources
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
                <DropdownMenuRadioGroup value={languageId} onValueChange={setLanguageId}>
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
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
            </button>

            <Button
              variant="outline"
              className="gap-2 border-amber-400 text-amber-600 hover:bg-amber-50 px-5 py-3 text-lg"
            >
              <Crown className="w-6 h-6" />
              Premium
            </Button>

            <Button variant="ghost" className="gap-2 px-5 py-3 text-lg">
              <User className="w-6 h-6" />
              Login
            </Button>
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
              <a href="#/commands" className="px-4 py-2.5 text-lg text-foreground/80 hover:text-primary">
                Commands
              </a>
              <a href="#" className="px-4 py-2.5 text-lg text-foreground/80 hover:text-primary">
                Modules
              </a>
              <a href="#" className="px-4 py-2.5 text-lg text-foreground/80 hover:text-primary">
                Resources
              </a>
              <div className="border-t border-border pt-2 mt-2">
                <Button className="w-full gap-2 bg-pink-500 hover:bg-pink-600 text-lg py-3">
                  <User className="w-6 h-6" />
                  Login
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
