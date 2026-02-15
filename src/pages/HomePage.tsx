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
    <main>
      <Hero />
      <TrustedBy />
      <CommandPlayground />
      <WelcomeMessages />
      <Roleplay />
      <Currency />
      <Utilities />
      <FeaturesGrid />
      <TrustedServers />
      <AIFeatures />
      <WikiCTA />
      <FinalCTA />
    </main>
  );
}
