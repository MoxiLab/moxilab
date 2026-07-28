import { motion, useInView } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Crown, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface RankingApiItem {
  rank?: number;
  name?: string;
  score?: number;
}

interface RankingApiResponse {
  items?: RankingApiItem[];
}

export function Currency() {
  const { t, language } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [rankingApi, setRankingApi] = useState<Array<{ name: string; score: number }>>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRanking() {
      try {
        const ac = new AbortController();
        const timer = window.setTimeout(() => ac.abort(), 5000);
        const response = await fetch('/api/economy/global-ranking?limit=5', {
          cache: 'no-store',
          signal: ac.signal,
        });
        window.clearTimeout(timer);

        if (!response.ok) throw new Error(`ranking_status_${response.status}`);

        const json = (await response.json()) as RankingApiResponse;
        const items = Array.isArray(json?.items) ? json.items : [];

        const normalized = items
          .map((item) => ({
            name: String(item?.name ?? '').trim(),
            score: Number(item?.score ?? 0),
          }))
          .filter((item) => item.name && Number.isFinite(item.score) && item.score >= 0);

        if (!cancelled) {
          setRankingApi(normalized);
        }
      } catch {
        if (!cancelled) {
          setRankingApi([]);
        }
      }
    }

    void loadRanking();
    return () => {
      cancelled = true;
    };
  }, []);

  const rankingList = useMemo(
    () =>
      [...rankingApi]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((user, index) => ({ ...user, rank: index + 1 })),
    [rankingApi]
  );

  const scoreFormatter = useMemo(
    () => new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US'),
    [language]
  );

  return (
    <section id="currency" ref={sectionRef} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Ranking Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-card/70 backdrop-blur rounded-2xl border border-border shadow-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-pink-500">{t('currency.ranking')}</span>
                </div>
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>

              <div className="space-y-3">
                {rankingList.map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      user.rank === 1
                        ? 'bg-primary/10 border border-primary/15'
                        : 'bg-muted/30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.rank === 1
                          ? 'bg-amber-400 text-white'
                          : user.rank === 2
                          ? 'bg-slate-300 text-slate-800 dark:bg-slate-500 dark:text-slate-100'
                          : user.rank === 3
                          ? 'bg-amber-700 text-amber-50 dark:bg-amber-800 dark:text-amber-100'
                          : 'bg-muted/70 text-muted-foreground'
                      }`}
                    >
                      {user.rank <= 3 ? (
                        <Crown className="w-4 h-4" />
                      ) : (
                        user.rank
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-pink-500">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">
                        {scoreFormatter.format(user.score)}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {rankingList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                    {t('currency.emptyRanking')}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t('currency.title')}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('currency.description1')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('currency.description2')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('currency.description3')}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors group"
            >
              {t('currency.link')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
