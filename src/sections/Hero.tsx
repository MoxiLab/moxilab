import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Link2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const floatingElements = [
  { icon: '⭐', delay: 0, x: '10%', y: '20%' },
  { icon: '💖', delay: 0.5, x: '85%', y: '15%' },
  { icon: '🎵', delay: 1, x: '80%', y: '60%' },
  { icon: '🐱', delay: 1.5, x: '15%', y: '70%' },
  { icon: '✨', delay: 2, x: '90%', y: '80%' },
];

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-[3rem] rotate-12 bg-pink-500/10 blur-3xl dark:bg-fuchsia-500/12" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-[3.25rem] -rotate-6 bg-indigo-500/10 blur-3xl dark:bg-indigo-400/12" />
      {/* Floating decorative elements */}
      {floatingElements.map((el, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl pointer-events-none select-none"
          style={{ left: el.x, top: el.y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {el.icon}
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Text content */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/15 text-primary rounded-full text-base font-semibold">
                <Sparkles className="w-4 h-4" />
                {t('hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-2xl"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-5"
            >
              <Button
                size="lg"
                className="gap-2 bg-pink-500 hover:bg-pink-600 text-white px-7 py-7 text-lg font-semibold rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                {t('common.addBot')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-7 py-7 text-lg font-semibold rounded-2xl border-border hover:bg-muted transition-all hover:scale-105"
              >
                <Link2 className="w-5 h-5" />
                {t('common.manageServers')}
              </Button>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Main image */}
              <div className="relative w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-[2.5rem] overflow-hidden">
                <img
                  src="/moxi-hero.jpg"
                  alt={t('hero.imageAlt')}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
