import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const features = [
  {
    key: 'cute',
    icon: Heart,
  },
  {
    key: 'adaptive',
    icon: Sparkles,
  },
  {
    key: 'companion',
    icon: Star,
  },
];

const chatMessages = [
  { key: 'greeting', delay: 0 },
  { key: 'help', delay: 0.5 },
  { key: 'imageGen', delay: 1, user: true },
  { key: 'madeWith', delay: 1.5, image: true },
];

export function AIFeatures() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20 bg-muted/20 dark:bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t('ai.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('ai.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <h3 className="text-xl font-semibold text-foreground">
              {t('ai.listTitle')}
            </h3>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {t(`ai.features.${feature.key}.title`)}
                      </h4>
                      <p className="text-muted-foreground">
                        {t(`ai.features.${feature.key}.description`)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Chat mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-card/70 backdrop-blur rounded-2xl border border-border shadow-xl p-6 max-w-md mx-auto">
              <div className="space-y-4">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: msg.delay }}
                    className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.image ? (
                      <div className="bg-muted rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                        <div className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg w-48 h-32 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-pink-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t(`ai.chat.${msg.key}`)}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                          msg.user
                            ? 'bg-pink-500 text-white rounded-tr-none'
                            : 'bg-muted text-foreground rounded-tl-none'
                        }`}
                      >
                        <p>{t(`ai.chat.${msg.key}`)}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
