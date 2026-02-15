import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
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
  { name: 'Anime', icon: Tv },
  { name: 'Roleplay', icon: Heart },
  { name: 'Starboard', icon: Star },
  { name: 'Giveaways', icon: Gift },
  { name: 'Birthdays', icon: Cake },
  { name: 'Levels', icon: TrendingUp },
  { name: 'Currency', icon: Coins },
  { name: 'Pets', icon: Cat },
  { name: 'Marriages', icon: HeartHandshake },
  { name: 'Moderation', icon: Shield },
  { name: 'Logs', icon: FileText },
  { name: 'Fun', icon: Smile },
  { name: 'Configuration', icon: Settings },
  { name: 'Utilities', icon: Wrench },
  { name: 'And more...', icon: MoreHorizontal },
];

export function FeaturesGrid() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-28 bg-muted/20 dark:bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            The all in one bot
          </h2>
          <p className="text-2xl text-pink-500 font-semibold">
            Moxi does everything
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
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
                    {feature.name}
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
