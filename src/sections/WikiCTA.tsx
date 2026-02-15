import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, Search, Users, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: BookOpen,
    title: 'Extensive Documentation',
    description: 'Over 600 commands documented in detail',
  },
  {
    icon: Search,
    title: 'Easy to Navigate',
    description: 'Find what you need quickly with our search feature',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Regular updates by our volunteer team',
  },
];

export function WikiCTA() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Tutorials and guides
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know is available on its official Wiki
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-pink-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
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
            Go to the Wiki
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
