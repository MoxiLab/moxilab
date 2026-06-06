import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import {
  Tv,
  Heart,
  Star,
  Gift,
  Cake,
  TrendingUp,
  Coins,
  Cat,
  HeartHandshake,
  Shield,
  FileText,
  Smile,
  Settings,
  Wrench,
  MoreHorizontal,
} from 'lucide-react';

const features = [
  { key: 'anime', icon: Tv },
  { key: 'roleplay', icon: Heart },
  { key: 'starboard', icon: Star },
  { key: 'giveaways', icon: Gift },
  { key: 'birthdays', icon: Cake },
  { key: 'levels', icon: TrendingUp },
  { key: 'currency', icon: Coins },
  { key: 'pets', icon: Cat },
  { key: 'marriages', icon: HeartHandshake },
  { key: 'moderation', icon: Shield },
  { key: 'logs', icon: FileText },
  { key: 'fun', icon: Smile },
  { key: 'configuration', icon: Settings },
  { key: 'utilities', icon: Wrench },
  { key: 'more', icon: MoreHorizontal },
];

export function FeaturesGrid() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="features-grid" ref={sectionRef} className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {t('featuresGrid.title')}
          </h2>
          <p className="text-2xl text-pink-500 font-semibold">
            {t('featuresGrid.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-card/70 backdrop-blur rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-border"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-pink-500" />
                  </div>
                  <span className="text-base font-semibold text-foreground/80 text-center">
                    {t(`featuresGrid.items.${feature.key}`)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
