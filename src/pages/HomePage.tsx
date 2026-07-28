import { Hero } from '@/sections/Hero';
import { CommandPlayground } from '@/sections/CommandPlayground';
import { TrustedBy } from '@/sections/TrustedBy';
import { WelcomeMessages } from '@/sections/WelcomeMessages';
import { Roleplay } from '@/sections/Roleplay';
import { Currency } from '@/sections/Currency';
import { Utilities } from '@/sections/Utilities';
import { FeaturesGrid } from '@/sections/FeaturesGrid';
import { TrustedServers } from '@/sections/TrustedServers';
import { AIFeatures } from '@/sections/AIFeatures';
import { WikiCTA } from '@/sections/WikiCTA';
import { FinalCTA } from '@/sections/FinalCTA';

export function HomePage() {
  return (
    <main className="sk-shell bg-background text-foreground">
      <div className="sk-paper" aria-hidden="true" />
      <div className="sk-stage">
        <section className="sk-panel sk-accent-peach">
          <Hero />
          <TrustedBy />
        </section>

        <section className="sk-panel sk-panel-right sk-accent-sky">
          <CommandPlayground />
        </section>

        <section className="sk-panel sk-panel-left sk-accent-lime">
          <WelcomeMessages />
          <Roleplay />
        </section>

        <section className="sk-panel sk-panel-right sk-accent-rose">
          <Currency />
        </section>

        <section className="sk-panel sk-panel-left sk-accent-sky">
          <Utilities />
          <FeaturesGrid />
        </section>

        <section className="sk-panel sk-panel-right sk-accent-lime">
          <TrustedServers />
          <AIFeatures />
        </section>

        <section className="sk-panel sk-accent-rose">
          <WikiCTA />
          <FinalCTA />
        </section>
      </div>
    </main>
  );
}
