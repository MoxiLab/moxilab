import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscordMockup, DiscordMessage, DiscordEmbed } from '@/components/DiscordMockup';
import { useI18n } from '@/lib/i18n';

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1500, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);
    return () => clearTimeout(timer);
  }, [target]);

  return <span>{count}</span>;
}

export function Roleplay() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 order-2 lg:order-1"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t('roleplay.title')}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('roleplay.description1')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('roleplay.description2')}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors group"
            >
              {t('roleplay.link')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Discord Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            <DiscordMockup>
              <DiscordMessage username="Moxi" app>
                <DiscordEmbed>
                  <div className="space-y-3">
                    <p className="text-[#dcddde] text-sm">
                      <span className="text-[#00b0f4]">@Gwee</span>{' '}
                      {t('roleplay.mockup.hugVerb')}{' '}
                      <span className="text-[#00b0f4]">@Kwee</span>{' '}
                      <span className="text-pink-400">💕</span>
                    </p>
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src="https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif"
                        alt="Anime hug"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t('roleplay.mockup.gifLabel')}</span>
                    </div>
                  </div>
                </DiscordEmbed>
                <div className="mt-2 text-sm text-[#dcddde]">
                  {t('roleplay.mockup.timesHugged')}{' '}
                  <span className="text-pink-400 font-bold">
                    {isInView && <AnimatedCounter target={42} />}
                  </span>
                </div>
              </DiscordMessage>
            </DiscordMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
