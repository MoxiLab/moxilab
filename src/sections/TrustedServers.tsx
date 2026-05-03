import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const FALLBACK_COUNT = 4_300_000;
const MAX_VISIBLE_SERVERS = 8;

interface TrustedServerItem {
  id: string;
  name: string;
  members: number;
  iconUrl: string | null;
  verified: boolean;
}

const FALLBACK_SERVERS: TrustedServerItem[] = [
  { id: 'germanclan', name: 'GermanClan', members: 334706, iconUrl: null, verified: true },
  { id: 'auroners', name: 'AURONERS', members: 320374, iconUrl: null, verified: true },
  { id: 'casa-elmariana', name: 'La Casa De ElMariana', members: 314042, iconUrl: null, verified: true },
  { id: 'mikies', name: '#MIKIES', members: 284421, iconUrl: null, verified: true },
  { id: 'asilo-dylantero', name: 'El Asilo de Dylantero', members: 193113, iconUrl: null, verified: true },
  { id: 'juansguarnizo', name: 'JuanSGuarnizo', members: 80519, iconUrl: null, verified: true },
  { id: 'rivers', name: 'Rivers', members: 73910, iconUrl: null, verified: true },
  { id: 'arigameplays', name: 'AriGameplays', members: 55665, iconUrl: null, verified: true },
];

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | undefined;
    const durationMs = 1200;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, target]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {new Intl.NumberFormat('es-ES', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(count)}+
    </motion.span>
  );
}

export function TrustedServers() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [guildCount, setGuildCount] = useState(FALLBACK_COUNT);
  const [servers, setServers] = useState<TrustedServerItem[]>(FALLBACK_SERVERS);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.guildCount === 'number' && data.guildCount > 0) {
          setGuildCount(data.guildCount);
        }
      })
      .catch(() => null);

    fetch('/api/guilds')
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        const top = items
          .map((g: { id?: string; name?: string; memberCount?: number; iconUrl?: string | null }) => ({
            id: String(g.id ?? ''),
            name: String(g.name ?? ''),
            members: Number(g.memberCount ?? 0),
            iconUrl: typeof g.iconUrl === 'string' ? g.iconUrl : null,
            verified: true,
          }))
          .filter((g: TrustedServerItem) => g.id && g.name)
          .sort((a: TrustedServerItem, b: TrustedServerItem) => b.members - a.members)
          .slice(0, MAX_VISIBLE_SERVERS);

        if (top.length > 0) {
          setServers(top);
        }
      })
      .catch(() => null);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-20 bg-gradient-to-b from-background via-primary/5 to-background dark:via-primary/10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-[3rem] rotate-12 bg-pink-300/25 blur-3xl dark:bg-fuchsia-400/10" />
        <div className="absolute -bottom-28 -right-24 h-96 w-96 rounded-[3.25rem] -rotate-6 bg-fuchsia-300/20 blur-3xl dark:bg-indigo-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(236,72,153,0.08)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 dark:opacity-25" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            {t('trustedServers.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
            {t('trustedServers.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('trustedServers.descriptionPrefix')}{' '}
            <span className="text-pink-600 font-semibold">
              {isInView && <AnimatedCounter target={guildCount} />}
            </span>{' '}
            {t('trustedServers.descriptionSuffix')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {servers.map((server, index) => (
            <motion.div
              key={server.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative rounded-2xl p-4 bg-card/60 backdrop-blur border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-pink-500/10 via-transparent to-fuchsia-500/10" />
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 border border-border flex items-center justify-center text-2xl shadow-sm">
                  {server.iconUrl ? (
                    <img src={server.iconUrl} alt={server.name} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-foreground/80">
                      {(server.name?.[0] ?? '?').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground truncate">
                      {server.name}
                    </span>
                    {server.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                        {t('trustedServers.verified')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 inline-flex items-center rounded-full bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {server.members.toLocaleString()} {t('trustedServers.members')}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
