export type AppLanguage = 'en' | 'es' | 'zh' | 'ja' | 'ko';
export type RouteKey = 'home' | 'commands' | 'dashboard' | 'premium';

const LANGUAGE_PREFIXES: AppLanguage[] = ['en', 'es', 'zh', 'ja', 'ko'];

const ROUTE_SLUGS: Record<AppLanguage, Record<RouteKey, string>> = {
  en: {
    home: '',
    commands: 'commands',
    dashboard: 'dashboard',
    premium: 'premium',
  },
  es: {
    home: '',
    commands: 'comandos',
    dashboard: 'panel',
    premium: 'premium',
  },
  zh: {
    home: '',
    commands: '命令',
    dashboard: '面板',
    premium: '高级版',
  },
  ja: {
    home: '',
    commands: 'コマンド',
    dashboard: 'ダッシュボード',
    premium: 'プレミアム',
  },
  ko: {
    home: '',
    commands: '명령어',
    dashboard: '대시보드',
    premium: '프리미엄',
  },
};

const ROUTE_SLUG_TO_KEY: Record<string, RouteKey> = {
  commands: 'commands',
  comandos: 'commands',
  命令: 'commands',
  コマンド: 'commands',
  명령어: 'commands',
  dashboard: 'dashboard',
  panel: 'dashboard',
  面板: 'dashboard',
  ダッシュボード: 'dashboard',
  대시보드: 'dashboard',
  premium: 'premium',
  高级版: 'premium',
  プレミアム: 'premium',
  프리미엄: 'premium',
};

export function isSupportedLanguage(value: string): value is AppLanguage {
  return LANGUAGE_PREFIXES.includes(value as AppLanguage);
}

export function getLanguageFromPathname(pathname: string): AppLanguage | null {
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0];
  if (!first || !isSupportedLanguage(first)) return null;
  return first;
}

function splitPathname(pathname: string) {
  return pathname.split(/[?#]/)[0].split('/').filter(Boolean);
}

function getRouteKeyFromSegments(segments: string[]): RouteKey {
  if (segments.length === 0) return 'home';
  const slug = segments[0].toLowerCase();
  return ROUTE_SLUG_TO_KEY[slug] ?? 'home';
}

export function getLocalizedSlug(language: AppLanguage, key: RouteKey) {
  return ROUTE_SLUGS[language][key];
}

export function getLocalizedPath(language: AppLanguage, key: RouteKey, tailSegments: string[] = []) {
  const slug = getLocalizedSlug(language, key);
  const tail = tailSegments.filter(Boolean).join('/');
  const base = slug ? `/${language}/${slug}` : `/${language}`;
  return tail ? `${base}/${tail}` : base;
}

export function localizePathname(pathname: string, language: AppLanguage) {
  const segments = splitPathname(pathname);
  if (segments.length === 0) return getLocalizedPath(language, 'home');

  const currentPrefix = isSupportedLanguage(segments[0]) ? segments[0] : null;
  const routeSegments = currentPrefix ? segments.slice(1) : segments;
  const routeKey = getRouteKeyFromSegments(routeSegments);
  const tailSegments = routeKey === 'home' ? routeSegments : routeSegments.slice(1);

  return getLocalizedPath(language, routeKey, tailSegments);
}
