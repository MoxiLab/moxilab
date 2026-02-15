import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();

  const resourcesLinks = [
    { name: t('footer.links.patreon'), href: '#' },
    { name: t('footer.links.wiki'), href: '#' },
    { name: t('footer.links.gallery'), href: '#' },
  ];

  const moxiLinks = [
    { name: t('footer.links.supportServer'), href: '#' },
    { name: t('footer.links.suggestions'), href: '#' },
    { name: t('footer.links.reports'), href: '#' },
    { name: t('footer.links.partners'), href: '#' },
  ];

  const legalLinks = [
    { name: t('footer.links.terms'), href: '#' },
    { name: t('footer.links.privacy'), href: '#' },
    { name: t('footer.links.refund'), href: '#' },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl overflow-hidden">
                <img
                  src="/moxi-hero.jpg"
                  alt="Moxi"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-lg text-foreground">Moxi</span>
            </a>
            <p className="text-muted-foreground text-sm mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                className="gap-2 bg-pink-500 hover:bg-pink-600"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                {t('common.invite')}
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {t('common.support')}
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.resources')}</h4>
            <ul className="space-y-3">
              {resourcesLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Moxi */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.moxi')}</h4>
            <ul className="space-y-3">
              {moxiLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
