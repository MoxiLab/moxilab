import { ArrowRight, CircleDot, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type LandingAction = {
  label: string;
  href: string;
  external?: boolean;
  variant?: 'default' | 'outline';
};

type PreviewStat = {
  label: string;
  value: string;
};

type LandingBenefit = {
  icon: LucideIcon;
  title: string;
  text: string;
};

type LandingStep = {
  number: string;
  title: string;
  text: string;
};

type LandingRelated = {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type MarketingLandingProps = {
  badge: string;
  title: string;
  subtitle: string;
  primaryAction: LandingAction;
  secondaryAction?: LandingAction;
  previewEyebrow: string;
  previewTitle: string;
  previewDescription: string;
  previewStats: PreviewStat[];
  benefitsLabel: string;
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: LandingBenefit[];
  stepsLabel: string;
  stepsTitle: string;
  steps: LandingStep[];
  relatedLabel: string;
  relatedTitle: string;
  related: LandingRelated[];
  finalTitle: string;
  finalAction: LandingAction;
};

function LandingActionButton({ action }: { action: LandingAction }) {
  const variant = action.variant ?? 'default';
  const className =
    variant === 'outline'
      ? 'border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white'
      : 'bg-pink-500 text-white hover:bg-pink-600';

  if (action.external) {
    return (
      <Button asChild variant={variant} className={className}>
        <a href={action.href} target="_blank" rel="noopener noreferrer">
          {action.label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} className={className}>
      <Link to={action.href}>{action.label}</Link>
    </Button>
  );
}

export function MarketingLanding({
  badge,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  previewEyebrow,
  previewTitle,
  previewDescription,
  previewStats,
  benefitsLabel,
  benefitsTitle,
  benefitsDescription,
  benefits,
  stepsLabel,
  stepsTitle,
  steps,
  relatedLabel,
  relatedTitle,
  related,
  finalTitle,
  finalAction,
}: MarketingLandingProps) {
  return (
    <main className="sk-page-flow relative overflow-hidden bg-transparent pt-24 text-white">
      <div className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-[3rem] rotate-12 bg-pink-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-28 top-[42%] h-80 w-80 rounded-[3rem] -rotate-6 bg-cyan-400/16 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-[8%] h-72 w-72 rounded-[3rem] rotate-6 bg-fuchsia-400/12 blur-3xl" />

      <section className="relative overflow-hidden border-b border-white/10 py-14">
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr,1fr] lg:px-8">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold text-white">
              {badge}
            </Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base text-white/72 sm:text-lg">{subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LandingActionButton action={primaryAction} />
              {secondaryAction ? <LandingActionButton action={secondaryAction} /> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1a1d34]/80 p-5 shadow-xl backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
              <CircleDot className="h-4 w-4 text-red-400" />
              {previewEyebrow}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/45">Moxi</p>
              <h3 className="mt-2 text-lg font-bold text-white">{previewTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">{previewDescription}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {previewStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-pink-200/70">{benefitsLabel}</p>
          <h2 className="mt-2 text-center text-2xl font-bold text-white sm:text-3xl">{benefitsTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-7 text-white/70">{benefitsDescription}</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-[#1a1d34] p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-pink-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold leading-tight text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-pink-200/70">{stepsLabel}</p>
          <h2 className="mt-2 text-center text-2xl font-bold text-white sm:text-3xl">{stepsTitle}</h2>
          <div className="mx-auto mt-10 grid max-w-6xl gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="text-center">
                <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-200 text-base font-bold text-[#1a1d34]">
                  {step.number}
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{step.number}</p>
                <h3 className="mt-2 text-lg font-bold text-white sm:text-xl">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/65">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              <span className="h-px flex-1 bg-white/10" />
              {relatedLabel}
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">{relatedTitle}</h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  className="rounded-2xl border border-white/10 bg-[#1a1d34] p-5 transition-all duration-200 hover:border-pink-300/25 hover:bg-[#202444]"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-white">{item.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/65">{item.description}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-pink-300">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{finalTitle}</h2>
          <div className="mt-8 flex justify-center">
            <LandingActionButton action={finalAction} />
          </div>
        </div>
      </section>
    </main>
  );
}