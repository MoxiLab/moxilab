import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscordMockup, DiscordMessage, DiscordEmbed } from '@/components/DiscordMockup';
import { useI18n } from '@/lib/i18n';

export function WelcomeMessages() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="welcome" ref={sectionRef} className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Discord Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <DiscordMockup>
              <DiscordMessage username="Moxi" app>
                <DiscordEmbed>
                  <div className="space-y-2">
                    <p className="text-[#dcddde] text-sm">
                      {t('welcomeMessages.mockup.line1')}
                    </p>
                    <p className="text-[#dcddde] text-sm">
                      {t('welcomeMessages.mockup.line2Prefix')}{' '}
                      <span className="text-[#00b0f4]">@User</span>! {t('welcomeMessages.mockup.line2Middle')}{' '}
                      <span className="font-bold">1,000</span> {t('welcomeMessages.mockup.line2Suffix')}
                    </p>
                  </div>
                </DiscordEmbed>
              </DiscordMessage>
            </DiscordMockup>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t('welcomeMessages.title')}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('welcomeMessages.description1')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('welcomeMessages.description2')}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors group"
            >
              {t('welcomeMessages.link')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
