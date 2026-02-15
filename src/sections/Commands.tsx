import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const ALL_CATEGORY = '__all__';
const OTHER_CATEGORY = '__other__';

type CommandItem = {
  _id?: string;
  name?: string;
  description?: string;
  category?: string;
  usage?: string;
  aliases?: string[];
  examples?: string[];
  cooldown?: number;
  type?: 'prefix' | 'slash' | string;
  subcommands?: Array<{
    name: string;
    group?: string;
    description?: string;
    usage?: string;
    fullName?: string;
  }>;
};

function isPlaceholderDescription(description: string) {
  const trimmed = description.trim();
  if (!trimmed) return true;
  if (trimmed.toLowerCase() === 'command') return true;
  if (/^commands:CMD_[A-Z0-9_]+_DESC$/.test(trimmed)) return true;
  return false;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export function Commands() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);

  const [allItems, setAllItems] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [selectedType, setSelectedType] = useState<'all' | 'prefix' | 'slash'>(
    'all'
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    const t = window.setTimeout(() => ac.abort(), 6000);

    async function loadOnce() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch('/api/commands?limit=5000', {
          signal: ac.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { items?: CommandItem[] };
        const next = Array.isArray(data.items) ? data.items : [];
        // Normalize a bit to avoid undefined categories.
        const normalized = next
          .map((cmd) => ({
            ...cmd,
            name: typeof cmd.name === 'string' ? cmd.name.trim() : cmd.name,
            category:
              typeof cmd.category === 'string' && cmd.category.trim()
                ? cmd.category.trim()
                : OTHER_CATEGORY,
            description:
              typeof cmd.description === 'string'
                ? cmd.description.trim()
                : cmd.description,
            usage: typeof cmd.usage === 'string' ? cmd.usage.trim() : cmd.usage,
          }))
          .filter((cmd) => typeof cmd.name === 'string' && cmd.name.length > 0);

        setAllItems(normalized);
      } catch {
        if (ac.signal.aborted) return;
        setAllItems([]);
        setError(true);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }

    loadOnce();
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const cmd of allItems) {
      const category = cmd.category ?? OTHER_CATEGORY;
      map.set(category, (map.get(category) ?? 0) + 1);
    }
    return map;
  }, [allItems]);

  const categories = useMemo(() => {
    const list = [...categoryCounts.keys()].sort((a, b) => a.localeCompare(b));
    const otherIndex = list.indexOf(OTHER_CATEGORY);
    if (otherIndex >= 0) {
      list.splice(otherIndex, 1);
      list.push(OTHER_CATEGORY);
    }
    return [ALL_CATEGORY, ...list];
  }, [categoryCounts]);

  const getCategoryLabel = (category: string) => {
    if (category === ALL_CATEGORY) return t('commands.category.all');
    if (category === OTHER_CATEGORY) return t('commands.category.other');
    return category;
  };

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return allItems
      .filter((cmd) => {
        const cmdType = cmd.type === 'prefix' ? 'prefix' : cmd.type === 'slash' ? 'slash' : undefined;
        if (selectedType !== 'all') {
          if (!cmdType) return false;
          if (cmdType !== selectedType) return false;
        }

        if (selectedCategory !== ALL_CATEGORY && cmd.category !== selectedCategory) {
          return false;
        }
        if (!q) return true;

        const haystack = [
          cmd.name,
          cmd.description,
          cmd.category,
          cmd.usage,
          ...(cmd.aliases ?? []),
          ...(cmd.subcommands?.flatMap((s) => [s.fullName, s.name, s.group, s.description, s.usage]) ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 500);
  }, [allItems, debouncedQuery, selectedCategory, selectedType]);

  const totalCount = allItems.length;
  const resultsCount = filteredItems.length;
  const countPrefix = useMemo(
    () => allItems.filter((c) => c.type === 'prefix').length,
    [allItems]
  );
  const countSlash = useMemo(
    () => allItems.filter((c) => c.type === 'slash').length,
    [allItems]
  );

  const CategoriesPanel = (
    <div className="rounded-2xl border bg-card/60 backdrop-blur p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{t('commands.categories')}</div>
        <Badge variant="secondary">{totalCount}</Badge>
      </div>

      <div className="mt-3">
        <ScrollArea className="h-[56vh] pr-3">
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = cat === selectedCategory;
              const count =
                cat === ALL_CATEGORY
                  ? totalCount
                  : (categoryCounts.get(cat) ?? 0);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setMobileFiltersOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="truncate">{getCategoryLabel(cat)}</span>
                  <span
                    className={cn(
                      'min-w-10 text-center rounded-full px-2 py-0.5 text-xs font-semibold',
                      isActive
                        ? 'bg-primary-foreground/15 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-pink-50/60 via-background to-pink-50/30 dark:from-fuchsia-500/10 dark:via-background dark:to-indigo-500/15">
      {/* soft background blobs (match Home vibe) */}
      <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-[3rem] rotate-12 bg-pink-500/10 blur-3xl dark:bg-fuchsia-500/12" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-[3.25rem] -rotate-6 bg-indigo-500/10 blur-3xl dark:bg-indigo-400/12" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {t('commands.title')}
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            {t('commands.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <div className="hidden lg:block">{CategoriesPanel}</div>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('commands.searchPlaceholder')}
                  className="h-11 pl-9"
                />
              </div>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      {t('commands.loading')}
                    </span>
                  ) : (
                    <span>
                      {resultsCount}{' '}
                      {resultsCount === 1
                        ? t('commands.resultsSingle')
                        : t('commands.resultsPlural')}
                    </span>
                  )}
                </div>

                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden gap-2"
                      type="button"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {t('commands.categories')}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[340px]">
                    <SheetHeader>
                      <SheetTitle>{t('commands.filters.filterTitle')}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">{CategoriesPanel}</div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                {t('commands.filters.all')}{' '}
                <span className="ml-2 text-xs opacity-80">{totalCount}</span>
              </Button>
              <Button
                type="button"
                variant={selectedType === 'prefix' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('prefix')}
              >
                {t('commands.filters.prefix')}{' '}
                <span className="ml-2 text-xs opacity-80">{countPrefix}</span>
              </Button>
              <Button
                type="button"
                variant={selectedType === 'slash' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('slash')}
              >
                {t('commands.filters.slash')}{' '}
                <span className="ml-2 text-xs opacity-80">{countSlash}</span>
              </Button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {t('commands.errors.load')}
              </div>
            )}

            <div className="mt-5 rounded-2xl border bg-card/60 backdrop-blur">
              <Accordion type="multiple" className="divide-y">
                {filteredItems.map((cmd, index) => {
                  const name = cmd.name ?? '—';
                  const description =
                    cmd.description && !isPlaceholderDescription(cmd.description)
                      ? cmd.description
                      : undefined;

                  const categoryLabel = cmd.category
                    ? getCategoryLabel(cmd.category)
                    : undefined;

                  const iconLetter = (
                    (categoryLabel?.[0] ?? name[0] ?? '?') as string
                  ).toUpperCase();

                  return (
                    <AccordionItem
                      key={`${name}-${index}`}
                      value={`${name}-${index}`}
                      className="px-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-9 w-9 rounded-lg border bg-muted flex items-center justify-center text-sm font-semibold">
                            {iconLetter}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold truncate">{name}</div>
                              {cmd.category ? (
                                <Badge variant="secondary" className="hidden sm:inline-flex">
                                  {categoryLabel}
                                </Badge>
                              ) : null}
                            </div>
                            {description ? (
                              <div className="mt-1 text-sm text-muted-foreground">
                                {description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="space-y-3">
                          {cmd.usage ? (
                            <div className="rounded-xl bg-muted px-3 py-2 text-sm">
                              <span className="font-semibold">{t('commands.labels.usage')}</span> {cmd.usage}
                            </div>
                          ) : null}

                          {cmd.aliases && cmd.aliases.length > 0 ? (
                            <div className="text-sm">
                              <div className="font-semibold mb-1">{t('commands.labels.aliases')}</div>
                              <div className="flex flex-wrap gap-2">
                                {cmd.aliases.slice(0, 12).map((a) => (
                                  <Badge key={a} variant="outline">
                                    {a}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {cmd.examples && cmd.examples.length > 0 ? (
                            <div className="text-sm">
                              <div className="font-semibold mb-1">{t('commands.labels.examples')}</div>
                              <div className="space-y-2">
                                {cmd.examples.slice(0, 5).map((ex, i) => (
                                  <div key={`${name}-ex-${i}`} className="rounded-xl bg-muted px-3 py-2">
                                    {ex}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {cmd.type === 'slash' && cmd.subcommands && cmd.subcommands.length > 0 ? (
                            <div className="text-sm">
                              <div className="font-semibold mb-2">{t('commands.labels.subcommands')}</div>
                              <div className="space-y-2">
                                {Object.entries(
                                  cmd.subcommands.reduce((acc, sc) => {
                                    const key = sc.group ? sc.group : '__nogroup__';
                                    acc[key] = acc[key] ?? [];
                                    acc[key].push(sc);
                                    return acc;
                                  }, {} as Record<string, NonNullable<CommandItem['subcommands']>>)
                                ).map(([group, list]) => {
                                  const title = group === '__nogroup__' ? null : group;
                                  return (
                                    <div key={group} className="rounded-xl border bg-card/50 p-3">
                                      {title ? (
                                        <div className="mb-2 flex items-center justify-between">
                                          <div className="font-semibold">{title}</div>
                                          <Badge variant="secondary">{list.length}</Badge>
                                        </div>
                                      ) : null}
                                      <div className="space-y-2">
                                        {list
                                          .slice()
                                          .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
                                          .slice(0, 50)
                                          .map((sc) => (
                                            <div key={sc.fullName ?? `${sc.group ?? ''}:${sc.name}`}
                                              className="rounded-lg bg-muted px-3 py-2"
                                            >
                                              <div className="flex items-center justify-between gap-3">
                                                <div className="font-semibold truncate">/{cmd.name} {sc.group ? `${sc.group} ` : ''}{sc.name}</div>
                                              </div>
                                              {sc.description ? (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                  {sc.description}
                                                </div>
                                              ) : null}
                                              {sc.usage ? (
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                  <span className="font-semibold">{t('commands.labels.usage')}</span> {sc.usage}
                                                </div>
                                              ) : null}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {typeof cmd.cooldown === 'number' ? (
                            <div className="text-sm text-muted-foreground">
                              {t('commands.labels.cooldown')} {cmd.cooldown}s
                            </div>
                          ) : null}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}

                {!loading && filteredItems.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {t('commands.empty')}
                  </div>
                ) : null}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
