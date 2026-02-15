import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Bell, Shield, ExternalLink } from 'lucide-react';
import { DiscordMockup, DiscordMessage, DiscordEmbed } from '@/components/DiscordMockup';

export function Utilities() {
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
              Utilities
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Moxi can perform automatic and entertainment tasks for your
              server.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Are you anxious for the next episode of your favorite anime? Moxi
              can notify you when it comes out.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Auto posting waifus, anime notifications, server protection, among
              others. Moxi can do it all.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors group"
            >
              Learn more about Utilities
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
              <div className="space-y-4">
                {/* Anime notification */}
                <DiscordMessage
                  username="Nini"
                  avatar="/nini.png"
                  nameClassName="font-semibold text-white"
                >
                  <div className="text-[#dcddde] text-sm">
                    /anime notify <span className="text-[#00b0f4]">Buddy Daddies</span>
                  </div>
                </DiscordMessage>
                <DiscordMessage username="Moxi" app>
                  <DiscordEmbed>
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">
                          New Episode Available
                        </p>
                        <p className="text-pink-400 text-sm mt-1">
                          Buddy Daddies
                        </p>
                        <p className="text-[#dcddde] text-sm">
                          Episode 8 - Nothing seek, nothing find
                        </p>
                        <button className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-pink-500/20 text-pink-400 text-xs rounded hover:bg-pink-500/30 transition-colors">
                          Watch Episode
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </DiscordEmbed>
                </DiscordMessage>

                {/* Server protection */}
                <DiscordMessage
                  username="Nini"
                  avatar="/nini.png"
                  nameClassName="font-semibold text-white"
                >
                  <div className="text-[#dcddde] text-sm">
                    /protection status
                  </div>
                </DiscordMessage>
                <DiscordMessage username="Moxi" app>
                  <DiscordEmbed color="#3ba55d">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">
                          Server Protection
                        </p>
                        <p className="text-[#dcddde] text-sm mt-1">
                          Anti-spam enabled. Your server is protected against
                          unauthorized invite links.
                        </p>
                      </div>
                    </div>
                  </DiscordEmbed>
                </DiscordMessage>
              </div>
            </DiscordMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
