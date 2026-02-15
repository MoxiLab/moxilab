import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscordMockup, DiscordMessage, DiscordEmbed } from '@/components/DiscordMockup';

export function WelcomeMessages() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20 bg-muted/20 dark:bg-muted/10">
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
                      Welcome to the server!
                    </p>
                    <p className="text-[#dcddde] text-sm">
                      I hope you enjoy your stay,{' '}
                      <span className="text-[#00b0f4]">@User</span>! We are now{' '}
                      <span className="font-bold">1,000</span> members.
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
              Welcome messages
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Moxi can customize welcome, farewell and boost messages for
              improving your server.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You can customize the messages with multiple variables so you can
              create unique and beautiful messages. With Moxi in your server,
              everyone will feel welcome!
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors group"
            >
              Learn more about Welcome messages
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
