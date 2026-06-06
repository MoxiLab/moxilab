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
    <main className="bg-gradient-to-br from-[#1a1630] via-[#13192c] to-[#10263a]">
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
