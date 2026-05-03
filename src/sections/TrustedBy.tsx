import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const FALLBACK_COUNT = 4_000_000;

function formatCount(n: number): { value: string; suffix: string } {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    // Si es entero muestra "4", si tiene decimales muestra "4.5"
    const value = Number.isInteger(m) ? m.toLocaleString() : m.toFixed(1);
    return { value, suffix: ' millones' };
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    const value = Number.isInteger(k) ? k.toLocaleString() : k.toFixed(1);
    return { value, suffix: ' mil' };
  }
  return { value: n.toLocaleString(), suffix: '' };
}

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  const { value, suffix } = formatCount(count);
  return <span ref={ref}>{value}{suffix}</span>;
}

export function TrustedBy() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [guildCount, setGuildCount] = useState(FALLBACK_COUNT);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (typeof data.guildCount === 'number' && data.guildCount > 0) {
          setGuildCount(data.guildCount);
        }
      })
      .catch(() => { /* usa fallback */ });
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-pink-500 font-semibold text-lg mb-4"
        >
          {t('trustedBy.kicker')}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-2"
        >
          <span className="relative inline-block">
            {guildCount >= 10_000 && <>{t('trustedBy.headingPrefix')}{' '}</>}
            <span className="text-gradient">
              <AnimatedCounter target={guildCount} />
            </span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 400 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M2 8C50 4 150 2 200 2C250 2 350 4 398 8"
                stroke="#f472b6"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
          </span>{' '}
          {t('trustedBy.headingSuffix')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg mt-6"
        >
          {t('trustedBy.description')}
        </motion.p>
      </div>
    </section>
  );
}
