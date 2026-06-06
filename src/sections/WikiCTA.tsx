import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, Search, Users, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const features = [
  {
    key: 'docs',
    icon: BookOpen,
  },
  {
    key: 'search',
    icon: Search,
  },
  {
    key: 'community',
    icon: Users,
  },
];

export function WikiCTA() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="wiki" ref={sectionRef} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t('wiki.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('wiki.subtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-pink-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {t(`wiki.features.${feature.key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(`wiki.features.${feature.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Button
            size="lg"
            variant="outline"
            className="gap-2 px-8 py-6 text-base font-semibold rounded-xl border-border hover:bg-muted transition-all hover:scale-105"
          >
            <Globe className="w-5 h-5" />
            {t('wiki.button')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
