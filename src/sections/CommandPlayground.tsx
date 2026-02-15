import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DiscordMessage, DiscordMockup } from '@/components/DiscordMockup';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

type Subcommand = {
  name: string;
  description?: string;
  fullName: string;
};

type CommandItem = {
  name: string;
  type: 'prefix' | 'slash';
  description?: string;
  category?: string;
  usage?: string;
  aliases?: string[];
  subcommands?: Subcommand[];
};

type CommandsJson = {
  generatedAt: string;
  count: number;
  countPrefix: number;
  countSlash: number;
  items: CommandItem[];
};

type PlaygroundEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

type PlaygroundEmbed = {
  color?: string;
  title?: string;
  description?: string;
  footerText?: string;
  fields?: PlaygroundEmbedField[];
};

type PlaygroundJob = {
  id?: string;
  title?: string;
  kind?: string;
  content?: string;
  embed?: PlaygroundEmbed;
  ui?: PlaygroundUi;
  rows?: EmbedRow[];
  raw?: {
    payload?: unknown;
    result?: unknown;
  };
};

type PlaygroundPreviewResponse = {
  ok: boolean;
  matched: boolean;
  pending?: boolean;
  status?: string;
  input?: string;
  job?: PlaygroundJob;
  error?: string;
};

type EmbedRow = {
  code: string;
  description: string;
};

type PlaygroundUi = {
  content?: string;
  components?: PlaygroundUiComponent[];
  flags?: number;
};

type PlaygroundUiComponent = {
  type: number;
  [key: string]: unknown;
};

type PlaygroundUiButton = {
  type: number;
  style?: number;
  label?: string;
  emoji?: { name?: string };
  disabled?: boolean;
  url?: string;
  custom_id?: string;
};

function renderMarkdownLite(text: string) {
  const lines = text.split('\n');
  return (
    <div className="pg-md">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="pg-md-spacer" />;

        const listMatch = trimmed.match(/^`?([^`]+)`?\s+»\s+(.+)$/);
        if (listMatch) {
          const code = listMatch[1].trim();
          const desc = listMatch[2].trim();
          return (
            <div key={idx} className="pg-md-line">
              <span className="pg-md-pill">{code}</span>
              <span className="pg-md-sep">»</span>
              <span className="pg-md-text">{desc}</span>
            </div>
          );
        }

        if (line.startsWith('### ')) {
          return (
            <div key={idx} className="pg-md-h3">
              {line.replace(/^###\s+/, '')}
            </div>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <div key={idx} className="pg-md-h2">
              {line.replace(/^##\s+/, '')}
            </div>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <div key={idx} className="pg-md-h1">
              {line.replace(/^#\s+/, '')}
            </div>
          );
        }

        if (trimmed.startsWith('> ')) {
          return (
            <div key={idx} className="pg-md-quote">
              <span className="pg-md-quote-mark">&gt;</span>
              <span>{trimmed.replace(/^>\s+/, '')}</span>
            </div>
          );
        }

        const parts = trimmed.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);
        return (
          <div key={idx} className="pg-md-paragraph">
            {parts.map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <span key={i} className="pg-md-strong">
                  {part.slice(2, -2)}
                </span>
              ) : part.startsWith('__') && part.endsWith('__') ? (
                <span key={i} className="pg-md-underline">
                  {part.slice(2, -2)}
                </span>
              ) : (
                <span key={i}>
                  {part.split(/(<@\d+>)/g).filter(Boolean).map((seg, j) =>
                    /^<@\d+>$/.test(seg) ? (
                      <span key={j} className="pg-mention">
                        @Nini
                      </span>
                    ) : (
                      <span key={j}>{seg}</span>
                    )
                  )}
                </span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}


export function CommandPlayground() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' });

  const [data, setData] = useState<CommandsJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState(false);

  const [preview, setPreview] = useState<PlaygroundPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setLoadError(false);
        const ac = new AbortController();
        const t = window.setTimeout(() => ac.abort(), 6000);

        const res = await fetch('/api/commands?limit=5000', {
          cache: 'no-store',
          signal: ac.signal,
        });

        window.clearTimeout(t);
        if (!res.ok) throw new Error(`Failed to load commands (${res.status})`);
        const json = (await res.json()) as CommandsJson;
        if (cancelled) return;
        setData(json);
      } catch {
        if (!cancelled) {
          setData(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const input = query.trim() ? query.trim() : '.auction help';
    const isDedupeKey = /^[a-f0-9]{40}$/i.test(input);

    async function fetchPreview() {
      try {
        setPreviewLoading(true);
        const ac = new AbortController();
        const t = window.setTimeout(() => ac.abort(), 5000);

        const res = await fetch(
          isDedupeKey
            ? `/api/playground/preview?dedupeKey=${encodeURIComponent(input)}`
            : `/api/playground/preview?input=${encodeURIComponent(input)}&autoCreate=1`,
          {
          cache: 'no-store',
          signal: ac.signal,
          }
        );

        window.clearTimeout(t);
        if (!res.ok) throw new Error(`Failed to load playground preview (${res.status})`);
        const json = (await res.json()) as PlaygroundPreviewResponse;
        if (cancelled) return;
        setPreview(json);
      } catch {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }

    const debounce = window.setTimeout(() => {
      void fetchPreview();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(debounce);
    };
  }, [query]);

  const quickPicks = useMemo(() => {
    const items = data?.items ?? [];
    const picks: Array<{ label: string; value: string }> = [];

    const audit = items.find((c) => c.type === 'slash' && c.name === 'audit');
    if (audit) picks.push({ label: '/audit', value: 'audit' });

    const auction = items.find((c) => c.type === 'slash' && c.name === 'auction');
    if (auction) picks.push({ label: '/auction', value: 'auction' });

    const ball = items.find((c) => c.type === 'prefix' && c.name === '8ball');
    if (ball) picks.push({ label: '.help', value: 'help' });

    if (picks.length >= 3) return picks.slice(0, 3);

    const fallback = items.slice(0, 3).map((c) => ({
      label: c.type === 'slash' ? `/${c.name}` : c.name,
      value: c.name,
    }));

    return [...picks, ...fallback].slice(0, 3);
  }, [data]);

  const niniText = useMemo(() => {
    const value = query.trim();
    if (value) return value;
    return '.auction';
  }, [query]);

  const previewJob = useMemo(() => {
    if (!preview?.matched) return null;
    return preview.job ?? null;
  }, [preview]);

  const previewUi = previewJob?.ui;

  function renderUiComponent(comp: PlaygroundUiComponent, index: number) {
    const type = comp.type;

    if (type === 17) {
      const children = (comp as { components?: PlaygroundUiComponent[] }).components ?? [];
      return (
        <div key={index} className="pg-card">
          {children.map((child, idx) => renderUiComponent(child, idx))}
        </div>
      );
    }

    if (type === 10) {
      const content = String((comp as { content?: string }).content ?? '').trim();
      if (!content) return null;
      return <div key={index}>{renderMarkdownLite(content)}</div>;
    }

    if (type === 14) {
      return <div key={index} className="pg-divider" />;
    }

    if (type === 1) {
      const row = (comp as { components?: PlaygroundUiButton[] }).components ?? [];
      return (
        <div key={index} className="pg-action-row">
          {row.map((btn, i) => renderUiComponent(btn as unknown as PlaygroundUiComponent, i))}
        </div>
      );
    }

    if (type === 2) {
      const btn = comp as PlaygroundUiButton;
      const style = btn.style ?? 2;
      const label = btn.label?.trim() || '';
      const emoji = btn.emoji?.name ? `${btn.emoji.name} ` : '';
      const text = `${emoji}${label || ' '}`.trim();
      const styleClass = `pg-btn pg-btn-${style}`;

      return (
        <button key={index} type="button" className={styleClass} disabled={btn.disabled}>
          {text || ' '}
        </button>
      );
    }

    if (type === 3) {
      const placeholder = String((comp as { placeholder?: string }).placeholder ?? t('commandPlayground.selectPlaceholder'));
      return (
        <div key={index} className="pg-select">
          {placeholder}
        </div>
      );
    }

    return null;
  }

  return (
    <section ref={sectionRef} className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/50 px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              {t('commandPlayground.kicker')}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mt-4 text-4xl sm:text-5xl font-bold text-foreground"
            >
              {t('commandPlayground.title')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-3 text-xl text-muted-foreground max-w-2xl"
            >
              {t('commandPlayground.description')}
            </motion.p>

            <div className="mt-6 flex flex-wrap gap-2">
              {quickPicks.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setQuery(p.value)}
                  className="rounded-2xl border border-border bg-card/50 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted/40 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('commandPlayground.placeholder')}
                  className="h-11 pl-9 rounded-2xl"
                />
              </div>
              <Button asChild variant="outline" className="rounded-2xl gap-2">
                <a href="#/commands">
                  <ExternalLink className="h-4 w-4" />
                  {t('common.viewAll')}
                </a>
              </Button>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              {loading ? (
                <span>{t('commandPlayground.loading')}</span>
              ) : data ? (
                <span>
                  {t('commandPlayground.counts', {
                    total: data.count,
                    prefix: data.countPrefix,
                    slash: data.countSlash,
                  })}
                  {previewLoading ? ` ${t('commandPlayground.previewLoading')}` : ''}
                  {preview && !preview.matched && preview.pending
                    ? ` ${t('commandPlayground.previewQueued', {
                        status: preview.status ?? t('commandPlayground.previewQueuedStatus'),
                      })}`
                    : ''}
                </span>
              ) : (
                <span>
                  {loadError
                    ? t('commandPlayground.errors.load')
                    : t('commandPlayground.errors.fallback')}
                </span>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative"
          >
            <DiscordMockup className="shadow-sm bg-gradient-to-br from-[#22122f] via-[#1c1630] to-[#121826]">
              <div className="space-y-4">
                <DiscordMessage
                  username="Nini"
                  avatar="/nini.png"
                  nameClassName="font-semibold text-white"
                  tag="WUUWA"
                  timestamp="19:01"
                >
                  <div className="text-[#dcddde] text-sm font-medium">{niniText}</div>
                </DiscordMessage>

                <DiscordMessage username="Moxi" app timestamp="19:01">
                  {previewUi?.components?.length ? (
                    <div className="pg-ui-wrap">
                      {previewUi.components.map((comp, idx) => renderUiComponent(comp, idx))}
                    </div>
                  ) : (
                    <div className="text-[#dcddde] text-sm">
                      {t('commandPlayground.noPreview')}
                    </div>
                  )}
                </DiscordMessage>
              </div>
            </DiscordMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
