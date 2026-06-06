import { motion } from 'framer-motion';
import { ArrowRight, Crown, Sparkles, ShieldCheck, Star, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const plans = [
  {
    key: 'basic',
    price: '$2.00',
    accent: 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
  },
  {
    key: 'intermediate',
    price: '$4.00',
    featured: true,
    accent: 'from-indigo-500/20 to-cyan-500/10 border-indigo-500/30',
  },
  {
    key: 'generative',
    price: '$4.00',
    accent: 'from-fuchsia-500/20 to-amber-500/10 border-fuchsia-500/30',
  },
] as const;

const planFeatureKeys = {
  basic: ['feature1', 'feature2', 'feature3'],
  intermediate: ['feature1', 'feature2', 'feature3'],
  generative: ['feature1', 'feature2', 'feature3'],
} as const;

export function PremiumPage() {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const pageClassName = isDark
    ? 'relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.18),_transparent_30%),radial-gradient(circle_at_85%_18%,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,_#191423_0%,_#151826_52%,_#111320_100%)] text-white'
    : 'relative min-h-screen overflow-hidden bg-[#fafafa]';

  const gridClassName = isDark
    ? 'pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]'
    : 'pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]';

  const heroCardClassName = isDark
    ? 'relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur'
    : 'relative overflow-hidden rounded-[2rem] border-border/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur';

  const infoChipClassName = isDark
    ? 'flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white shadow-sm backdrop-blur'
    : 'flex items-center gap-2 rounded-2xl border border-border/70 bg-white/85 px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur';

  const planCardClassName = isDark
    ? `h-full rounded-[1.75rem] border border-white/10 bg-white/7 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isDark && plans[1].featured ? 'ring-1 ring-pink-400/30 shadow-pink-500/10' : ''
      }`
    : `h-full rounded-[1.75rem] border-border/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        plans[1].featured ? 'ring-1 ring-pink-300 shadow-pink-500/10' : ''
      }`;

  return (
    <main className={pageClassName}>
      <div className={gridClassName} />
      <div className={isDark ? 'pointer-events-none absolute -top-20 right-6 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl' : 'pointer-events-none absolute -top-20 right-6 h-72 w-72 rounded-full bg-pink-300/12 blur-3xl'} />
      <div className={isDark ? 'pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl' : 'pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-violet-300/10 blur-3xl'} />
      <div className={isDark ? 'pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-fuchsia-500/10 to-transparent' : 'pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-pink-50/70 to-transparent'} />

      <section className="relative pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <Badge variant="secondary" className="mb-5 gap-2 rounded-full px-4 py-1.5 text-sm shadow-sm">
                <Crown className="w-4 h-4" />
                {t('premiumPage.badge')}
              </Badge>

              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t('premiumPage.title')}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {t('premiumPage.description')}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="h-12 gap-2 rounded-full bg-pink-500 px-6 text-base font-semibold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-600">
                  {t('premiumPage.ctaFeatured')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="h-12 rounded-full px-6 text-base font-semibold">
                  {t('premiumPage.patreonLink')}
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  t('premiumPage.plans.basic.feature2'),
                  t('premiumPage.plans.intermediate.feature3'),
                  t('premiumPage.plans.generative.feature1'),
                ].map((item) => (
                  <div
                    key={item}
                    className={infoChipClassName}
                  >
                    <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="relative"
            >
              <div className={isDark ? 'absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/12 via-indigo-500/10 to-transparent blur-2xl' : 'absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-pink-400/12 via-violet-400/10 to-transparent blur-2xl'} />
              <Card className={heroCardClassName}>
                <CardHeader className={isDark ? 'border-b border-white/10 bg-gradient-to-r from-white/8 to-white/4 p-6' : 'border-b border-border/60 bg-gradient-to-r from-pink-50 to-violet-50/70 p-6'}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Badge variant="outline" className={isDark ? 'rounded-full border-white/15 bg-white/10 text-white' : 'rounded-full bg-white/80'}>
                        {t('premiumPage.badge')}
                      </Badge>
                      <CardTitle className={isDark ? 'mt-3 text-2xl text-white' : 'mt-3 text-2xl text-foreground'}>
                        {t('premiumPage.plans.intermediate.name')}
                      </CardTitle>
                      <CardDescription className={isDark ? 'mt-2 max-w-md text-base text-white/70' : 'mt-2 max-w-md text-base'}>
                        {t('premiumPage.plans.intermediate.description')}
                      </CardDescription>
                    </div>
                    <div className={isDark ? 'rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-right shadow-sm' : 'rounded-2xl border border-pink-200 bg-white px-4 py-3 text-right shadow-sm'}>
                      <div className={isDark ? 'text-3xl font-black text-white' : 'text-3xl font-black text-foreground'}>{plans[1].price}</div>
                      <div className={isDark ? 'text-sm text-white/65' : 'text-sm text-muted-foreground'}>USD {t('premiumPage.period')}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      t('premiumPage.plans.basic.feature1'),
                      t('premiumPage.plans.intermediate.feature2'),
                      t('premiumPage.plans.generative.feature2'),
                      t('premiumPage.plans.generative.feature3'),
                    ].map((feature) => (
                      <div key={feature} className={isDark ? 'flex items-start gap-3 rounded-2xl border border-white/10 bg-white/7 px-4 py-3' : 'flex items-start gap-3 rounded-2xl border border-border/70 bg-slate-50/80 px-4 py-3'}>
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                        <span className={isDark ? 'text-sm text-white/85' : 'text-sm text-foreground/90'}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className={isDark ? 'rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/7 to-white/4 p-4 shadow-sm' : 'rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm'}>
                    <div className="flex items-center justify-between">
                      <div className={isDark ? 'flex items-center gap-2 text-sm font-semibold text-white' : 'flex items-center gap-2 text-sm font-semibold text-foreground'}>
                        <Star className="h-4 w-4 text-pink-500" />
                        {t('premiumPage.planLabel')}
                      </div>
                      <div className={isDark ? 'text-sm text-white/65' : 'text-sm text-muted-foreground'}>{t('premiumPage.ctaFeatured')}</div>
                    </div>
                    <div className={isDark ? 'mt-3 h-2 overflow-hidden rounded-full bg-white/10' : 'mt-3 h-2 overflow-hidden rounded-full bg-slate-200'}>
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={plan.featured ? 'lg:-mt-4' : ''}
              >
                <Card className={`${planCardClassName} ${plan.featured ? (isDark ? 'ring-1 ring-pink-400/30 shadow-pink-500/10' : 'ring-1 ring-pink-300 shadow-pink-500/10') : ''}`}>
                  <CardHeader className="space-y-4 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className={isDark ? 'flex items-center gap-2 text-2xl text-white' : 'flex items-center gap-2 text-2xl'}>
                        <Sparkles className="h-5 w-5 text-pink-500" />
                        {t(`premiumPage.plans.${plan.key}.name`)}
                      </CardTitle>
                      <Badge variant="outline" className={isDark ? 'rounded-full border-white/15 bg-white/8 text-white' : 'rounded-full'}>
                        {t('premiumPage.planLabel')}
                      </Badge>
                    </div>
                    <CardDescription className={isDark ? 'text-base leading-7 text-white/70' : 'text-base leading-7'}>
                      {t(`premiumPage.plans.${plan.key}.description`)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    <div className="flex items-end gap-2">
                      <span className={isDark ? 'text-4xl font-black text-white' : 'text-4xl font-black text-foreground'}>{plan.price}</span>
                      <span className={isDark ? 'pb-1 text-sm text-white/65' : 'pb-1 text-sm text-muted-foreground'}>USD {t('premiumPage.period')}</span>
                    </div>

                    <Separator className="my-5" />

                    <ul className={isDark ? 'space-y-3 text-sm text-white/85' : 'space-y-3 text-sm text-foreground/90'}>
                      {planFeatureKeys[plan.key].map((featureKey) => (
                        <li key={featureKey} className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                          <span>{t(`premiumPage.plans.${plan.key}.${featureKey}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    <Button
                      className={`h-12 w-full gap-2 rounded-full text-base font-semibold text-white ${plan.featured ? 'bg-pink-500 hover:bg-pink-600' : isDark ? 'bg-white text-slate-900 hover:bg-white/90' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                      {plan.featured ? t('premiumPage.ctaFeatured') : t('premiumPage.ctaDefault')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}