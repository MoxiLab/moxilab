import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookOpen,
  Bot,
  Box,
  Coins,
  Crown,
  Cpu,
  Gift,
  HeartHandshake,
  Radio,
  MessageSquare,
  Music,
  Settings2,
  Shield,
  Sparkles,
  Swords,
  Ticket,
  Wrench,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export interface RawModule {
  /** ID del módulo tal como lo devuelve el bot (ej: "economy", "Economía") */
  id: string;
  icon?: string;
  configColor?: string;
  dashboardColor?: string;
  [key: string]: unknown;
}

export interface ResolvedModule {
  id: string;
  Icon: LucideIcon;
  dashboardColor: string;
  configColor: string;
}

function normalizeModuleId(value: string): string {
  const key = String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const aliases: Record<string, string> = {
    welcome: 'welcome',
    bienvenida: 'welcome',
    'sistema de bienvenida': 'welcome',
    roleplay: 'roleplay',
    rol: 'roleplay',
    economia: 'economy',
    economy: 'economy',
    utilidades: 'utilities',
    utilidad: 'utilities',
    herramientas: 'utilities',
    utilities: 'utilities',
    moderacion: 'moderation',
    moderation: 'moderation',
    musica: 'music',
    music: 'music',
    ia: 'ai',
    'inteligencia artificial': 'ai',
    ai: 'ai',
    sorteos: 'giveaways',
    giveaways: 'giveaways',
    tickets: 'tickets',
    soporte: 'tickets',
    logs: 'logs',
    registros: 'logs',
    automod: 'automod',
    automoderacion: 'automod',
    wiki: 'wiki',
    voice: 'voice',
    voz: 'voice',
    owner: 'owner',
    propietario: 'owner',
    fun: 'fun',
    diversion: 'fun',
    juegos: 'fun',
    administration: 'administration',
    administracion: 'administration',
    sistema: 'systems',
    sistemas: 'systems',
    systems: 'systems',
    streaming: 'streaming',
    genshin: 'genshin',
    matrimonio: 'matrimonio',
  };

  return aliases[key] ?? key.replace(/\s+/g, '-');
}

/** Decoración visual por ID de módulo. Solo es necesario para módulos conocidos;
 *  los nuevos módulos del bot reciben un icono/color genérico automáticamente. */
const MODULE_STYLE: Record<string, { Icon: LucideIcon; dashboardColor: string; configColor: string }> = {
  welcome:    { Icon: MessageSquare, dashboardColor: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',       configColor: 'from-blue-500 to-cyan-500' },
  roleplay:   { Icon: Swords,        dashboardColor: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',       configColor: 'from-rose-500 to-pink-500' },
  economy:    { Icon: Coins,         dashboardColor: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',  configColor: 'from-yellow-500 to-amber-500' },
  utilities:  { Icon: Wrench,        dashboardColor: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',     configColor: 'from-slate-500 to-gray-500' },
  moderation: { Icon: Shield,        dashboardColor: 'from-red-500/20 to-orange-500/20 border-red-500/30',       configColor: 'from-red-500 to-orange-500' },
  ai:         { Icon: Sparkles,      dashboardColor: 'from-violet-500/20 to-purple-500/20 border-violet-500/30', configColor: 'from-violet-500 to-purple-500' },
  music:      { Icon: Music,         dashboardColor: 'from-green-500/20 to-emerald-500/20 border-green-500/30',  configColor: 'from-green-500 to-emerald-500' },
  giveaways:  { Icon: Gift,          dashboardColor: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30', configColor: 'from-fuchsia-500 to-pink-500' },
  tickets:    { Icon: Ticket,        dashboardColor: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',   configColor: 'from-indigo-500 to-blue-500' },
  logs:       { Icon: Bell,          dashboardColor: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30',       configColor: 'from-teal-500 to-cyan-500' },
  automod:    { Icon: Bot,           dashboardColor: 'from-orange-500/20 to-red-500/20 border-orange-500/30',    configColor: 'from-orange-500 to-red-500' },
  wiki:       { Icon: BookOpen,      dashboardColor: 'from-lime-500/20 to-green-500/20 border-lime-500/30',      configColor: 'from-lime-500 to-green-500' },
  administration: { Icon: Settings2, dashboardColor: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30',     configColor: 'from-slate-500 to-zinc-500' },
  owner:      { Icon: Crown,         dashboardColor: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',   configColor: 'from-amber-500 to-yellow-500' },
  fun:        { Icon: Gift,          dashboardColor: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',        configColor: 'from-pink-500 to-rose-500' },
  systems:    { Icon: Cpu,           dashboardColor: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',      configColor: 'from-blue-500 to-indigo-500' },
  streaming:  { Icon: Radio,         dashboardColor: 'from-red-500/20 to-pink-500/20 border-red-500/30',          configColor: 'from-red-500 to-pink-500' },
  genshin:    { Icon: Sparkles,      dashboardColor: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30', configColor: 'from-purple-500 to-fuchsia-500' },
  matrimonio: { Icon: HeartHandshake,dashboardColor: 'from-rose-500/20 to-red-500/20 border-rose-500/30',         configColor: 'from-rose-500 to-red-500' },
};

const FALLBACK_STYLE = {
  Icon: Box,
  dashboardColor: 'from-slate-500/20 to-slate-600/20 border-slate-500/30',
  configColor: 'from-slate-500 to-slate-600',
};

function resolveModules(raw: RawModule[]): ResolvedModule[] {
  return raw.map((m) => {
    const id = normalizeModuleId(m.id);
    const style = MODULE_STYLE[id] ?? FALLBACK_STYLE;
    const iconFromApi = typeof m.icon === 'string'
      ? (LucideIcons as unknown as Record<string, LucideIcon>)[m.icon]
      : undefined;

    return {
      id,
      Icon: iconFromApi ?? style.Icon,
      dashboardColor: typeof m.dashboardColor === 'string' && m.dashboardColor.trim()
        ? m.dashboardColor
        : style.dashboardColor,
      configColor: typeof m.configColor === 'string' && m.configColor.trim()
        ? m.configColor
        : style.configColor,
    };
  });
}

let cache: ResolvedModule[] | null = null;

export function useModules() {
  const [modules, setModules] = useState<ResolvedModule[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache !== null) return;
    fetch('/api/modules')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ items: RawModule[] }>;
      })
      .then((data) => {
        cache = resolveModules(data.items ?? []);
        setModules(cache);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return { modules, isLoading, error };
}
