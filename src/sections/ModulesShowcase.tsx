import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useModules } from '@/hooks/use-modules';

function prettyModuleName(id: string) {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ModulesShowcase() {
  const { t } = useI18n();
  const { modules } = useModules();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="modules"
      ref={sectionRef}
      className="relative overflow-hidden py-20 bg-muted/20 dark:bg-muted/10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-[-10rem] h-[28rem] w-[28rem] rounded-[3.25rem] rotate-12 bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-[-12rem] h-[30rem] w-[30rem] rounded-[3.5rem] -rotate-6 bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            {t('modulesShowcase.badge')}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-5 text-3xl sm:text-4xl font-bold text-foreground"
          >
            {t('modulesShowcase.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-3 text-lg text-muted-foreground"
          >
            {t('modulesShowcase.description')}
          </motion.p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, index) => {
            const Icon = m.Icon;
            const titleKey = `modulesShowcase.modules.${m.id}.title`;
            const descriptionKey = `modulesShowcase.modules.${m.id}.description`;
            const titleText = t(titleKey);
            const descriptionText = t(descriptionKey);
            const chips = t(`modulesShowcase.modules.${m.id}.chips`) as unknown as string[];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.06 + index * 0.04 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-fuchsia-500/10" />
                <div className="relative flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-border">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-foreground">
                      {titleText === titleKey ? prettyModuleName(m.id) : titleText}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {descriptionText === descriptionKey ? t('modulesShowcase.description') : descriptionText}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap gap-2">
                  {Array.isArray(chips) && chips.map((chip, chipIndex) => (
                    <span
                      key={`${m.id}-${chipIndex}`}
                      className="inline-flex items-center rounded-full bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
