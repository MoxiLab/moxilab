import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ArrowRight, RotateCcw, Save } from 'lucide-react';
import { useModules } from '@/hooks/use-modules';
import { getDashboardBackgroundTheme } from '@/lib/dashboard-background';

function prettyModuleName(id: string) {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeText(value: string) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeModuleId(value: string) {
  const key = normalizeText(value);
  if (!key) return '';

  const aliases = new Map([
    // economy
    ['economy', 'economy'],
    ['economia', 'economy'],
    ['economía', 'economy'],
    // fun
    ['fun', 'fun'],
    ['diversión', 'fun'],
    ['diversion', 'fun'],
    // games
    ['games', 'games'],
    ['juegos', 'games'],
    // genshin
    ['genshin', 'genshin'],
    // giveaways
    ['giveaways', 'giveaways'],
    ['sorteos', 'giveaways'],
    ['sorteo', 'giveaways'],
    // matrimonio
    ['matrimonio', 'matrimonio'],
    ['marriage', 'matrimonio'],
    ['boda', 'matrimonio'],
    // moderation
    ['moderation', 'moderation'],
    ['moderacion', 'moderation'],
    ['moderación', 'moderation'],
    // music
    ['music', 'music'],
    ['musica', 'music'],
    ['música', 'music'],
    // security
    ['security', 'security'],
    ['seguridad', 'security'],
    // sistemas
    ['sistemas', 'sistemas'],
    // social
    ['social', 'social'],
    // streaming
    ['streaming', 'streaming'],
    // systems
    ['systems', 'systems'],
    ['system', 'systems'],
    ['sistema', 'sistemas'],
    // tickets
    ['tickets', 'tickets'],
    ['soporte', 'tickets'],
    // tools
    ['tools', 'tools'],
    ['herramientas', 'tools'],
    // utiility
    ['utiility', 'utiility'],
    ['utility', 'utiility'],
    ['utilidades', 'utiility'],
    ['utilidad', 'utiility'],
    // verification
    ['verification', 'verification'],
    ['verificacion', 'verification'],
    ['verificación', 'verification'],
    ['verificar', 'verification'],
    // voice
    ['voice', 'voice'],
    ['voz', 'voice'],
  ]);

  return aliases.get(key) ?? key.replace(/\s+/g, '-');
}

type ApiCommand = {
  name?: string;
  type?: 'prefix' | 'slash' | string;
  category?: string;
  subcommands?: Array<{ fullName?: string; name?: string; group?: string }>;
};

type GuildChannel = { id: string; name: string; type: number; parentId: string | null };
type GuildRole = { id: string; name: string; color: number; position: number };
type GuildMember = { id: string; username: string; displayName: string; avatar: string | null };

type ConfigItem = {
  label: string;
  value?: string;
  enabled?: boolean;
  kind?: 'text' | 'select' | 'slider' | 'channel' | 'role' | 'user';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
};

type ConfigSection = {
  title: string;
  description: string;
  items: ConfigItem[];
};

type ModulePreset = {
  summary: string[];
  sections: ConfigSection[];
  commands: string[];
};

type MusicPanelPreview = {
  ok: boolean;
  state?: 'idle' | 'active';
  configured?: boolean;
  panel?: {
    title?: string;
    info?: string;
    imageUrl?: string | null;
    footerText?: string;
    channelId?: string | null;
    messageId?: string | null;
    activeFilter?: string | null;
  };
};

function buildInitialValues(preset: ModulePreset) {
  const values: Record<string, string> = {};
  const toggles: Record<string, boolean> = {};

  for (const section of preset.sections) {
    for (const item of section.items) {
      if (typeof item.enabled === 'boolean') {
        toggles[item.label] = item.enabled;
      }
      if (typeof item.value === 'string') {
        values[item.label] = item.value;
      }
    }
  }

  return { values, toggles };
}

function moduleLocalConfigKey(guildId: string, moduleId: string) {
  return `moxi_module_cfg_v1:${guildId}:${moduleId}`;
}

function buildModulePreset(moduleId: string): ModulePreset {
  const presets: Record<string, ModulePreset> = {
    welcome: {
      summary: ['Mensajes de entrada', 'Mensajes de salida', 'Auto roles'],
      sections: [
        {
          title: 'Mensajes automáticos',
          description: 'Define cómo se recibe a cada miembro nuevo y qué eventos quieres anunciar.',
          items: [
            { label: 'Mensaje de bienvenida', enabled: true },
            { label: 'Mensaje de despedida', enabled: false },
            { label: 'Canal principal', value: '', kind: 'channel' },
          ],
        },
        {
          title: 'Asignación inicial',
          description: 'Controla los roles y comprobaciones que se aplican al entrar.',
          items: [
            { label: 'Auto rol', enabled: true },
            { label: 'Rol por defecto', value: '', kind: 'role' },
            { label: 'Verificación previa', enabled: true },
          ],
        },
      ],
      commands: ['/welcome setup', '/autorole', '/goodbye'],
    },
    moderation: {
      summary: ['AutoMod', 'Sanciones', 'Usuarios', 'Logs'],
      sections: [
        {
          title: 'Canal y acceso',
          description: 'Define dónde se aplican comandos de moderación y si deben usarse en un canal dedicado.',
          items: [
            { label: 'Moderación activa', enabled: true },
            { label: 'Canal de moderación', value: '', kind: 'channel' },
            { label: 'Solo en canal de moderación', enabled: false },
          ],
        },
        {
          title: 'Filtros automáticos',
          description: 'Activa reglas de protección para spam, enlaces, menciones masivas y lenguaje tóxico.',
          items: [
            { label: 'Anti spam', enabled: true },
            { label: 'Bloqueo de enlaces', enabled: true },
            { label: 'Filtro de palabras prohibidas', enabled: true },
            { label: 'Límite de menciones', value: '5', kind: 'slider', min: 1, max: 20, step: 1, suffix: ' menciones' },
            { label: 'Nivel de tolerancia', value: 'Medio', kind: 'select', options: ['Bajo', 'Medio', 'Alto'] },
          ],
        },
        {
          title: 'Sanciones automáticas',
          description: 'Decide qué castigos aplicar cuando AutoMod detecta una infracción.',
          items: [
            { label: 'Advertencias automáticas', enabled: true },
            { label: 'Logs activos', enabled: true },
            { label: 'Timeout automático', enabled: true },
            { label: 'Kick automático', enabled: false },
            { label: 'Ban automático', enabled: false },
            { label: 'Duración timeout', value: '10', kind: 'slider', min: 1, max: 60, step: 1, suffix: ' min' },
            { label: 'Canal de logs', value: '', kind: 'channel' },
          ],
        },
        {
          title: 'Equipo de moderación',
          description: 'Selecciona usuarios y roles clave para supervisión, alertas y escalado de incidentes.',
          items: [
            { label: 'Moderador principal', value: '', kind: 'user' },
            { label: 'Moderador de respaldo', value: '', kind: 'user' },
            { label: 'Rol moderador', value: '', kind: 'role' },
            { label: 'Rol staff senior', value: '', kind: 'role' },
          ],
        },
        {
          title: 'Excepciones y seguimiento',
          description: 'Configura usuarios exentos y controles de actividad para auditoría.',
          items: [
            { label: 'Usuario exento 1', value: '', kind: 'user' },
            { label: 'Usuario exento 2', value: '', kind: 'user' },
            { label: 'Guardar historial de sanciones', enabled: true },
            { label: 'Notificar sanciones por DM', enabled: true },
          ],
        },
      ],
      commands: ['.warn', '.mute', '.unmute', '.kick', '.ban', '.unban', '.slowmode', '.clear', '/warn', '/timeout', '/kick', '/ban'],
    },
    economy: {
      summary: ['Moneda', 'Trabajo', 'Tienda', 'Apuestas', 'Mascota'],
      sections: [
        {
          title: 'Canal y acceso',
          description: 'Restringe los comandos de economía a un canal específico del servidor.',
          items: [
            { label: 'Economía activa', enabled: true },
            { label: 'Canal de economía', value: '', kind: 'channel' },
            { label: 'Solo en canal de economía', enabled: false },
          ],
        },
        {
          title: 'Moneda y recompensas diarias',
          description: 'Configura la moneda del servidor y cuánto reciben los usuarios con .daily.',
          items: [
            { label: 'Daily activo', enabled: true },
            { label: 'Daily mínimo', value: '200', kind: 'slider', min: 0, max: 2000, step: 50, suffix: ' coins' },
            { label: 'Daily máximo', value: '400', kind: 'slider', min: 0, max: 5000, step: 50, suffix: ' coins' },
            { label: 'Multiplicador premium', value: '1.15', kind: 'text' },
          ],
        },
        {
          title: 'Trabajo y salario',
          description: 'Controla el sistema .work, los empleos disponibles y el salario por turno.',
          items: [
            { label: 'Sistema de trabajo activo', enabled: true },
            { label: 'Work mínimo', value: '100', kind: 'slider', min: 0, max: 1000, step: 25, suffix: ' coins' },
            { label: 'Work máximo', value: '300', kind: 'slider', min: 0, max: 3000, step: 25, suffix: ' coins' },
            { label: 'Cooldown de trabajo', value: '60', kind: 'slider', min: 5, max: 480, step: 5, suffix: ' min' },
            { label: 'Sistema de salario activo', enabled: true },
            { label: 'Salario mínimo', value: '250', kind: 'slider', min: 0, max: 2000, step: 50, suffix: ' coins' },
            { label: 'Salario máximo', value: '550', kind: 'slider', min: 0, max: 5000, step: 50, suffix: ' coins' },
          ],
        },
        {
          title: 'Actividades de recursos',
          description: 'Habilita la recolección de recursos: pesca (.fish), minería (.mine) y tala (.chop).',
          items: [
            { label: 'Pesca activa', enabled: true },
            { label: 'Minería activa', enabled: true },
            { label: 'Tala activa', enabled: true },
            { label: 'Cooldown de recursos', value: '30', kind: 'slider', min: 5, max: 240, step: 5, suffix: ' min' },
          ],
        },
        {
          title: 'Crimen e inversiones',
          description: 'Permite a los usuarios cometer crímenes (.crime) o invertir su saldo (.invest).',
          items: [
            { label: 'Crimen activo', enabled: true },
            { label: 'Inversiones activas', enabled: true },
            { label: 'Cooldown de crimen', value: '20', kind: 'slider', min: 5, max: 120, step: 5, suffix: ' min' },
          ],
        },
        {
          title: 'Apuestas y casino',
          description: 'Controla los juegos de azar: moneda (.coinflip), ruleta (.roulette) y tragaperras (.slots).',
          items: [
            { label: 'Coinflip activo', enabled: true },
            { label: 'Ruleta activa', enabled: true },
            { label: 'Slots activos', enabled: true },
            { label: 'Carreras activas', enabled: true },
          ],
        },
        {
          title: 'Tienda y mercado',
          description: 'Configura la tienda global, la tienda del servidor, el mercado de jugadores y las subastas.',
          items: [
            { label: 'Tienda global activa', enabled: true },
            { label: 'Tienda del servidor activa', enabled: true },
            { label: 'Mercado de jugadores activo', enabled: true },
            { label: 'Subasta activa', enabled: true },
            { label: 'Mercado negro activo', enabled: false },
          ],
        },
        {
          title: 'Mascotas y crafting',
          description: 'Activa el sistema de mascotas (.pet), crafteo (.craft), mezcla (.mix) y quests (.quest).',
          items: [
            { label: 'Sistema de mascotas activo', enabled: true },
            { label: 'Crafteo activo', enabled: true },
            { label: 'Quests activas', enabled: true },
            { label: 'Fortunas activas', enabled: true },
          ],
        },
        {
          title: 'Rankings y leaderboard',
          description: 'Configura la visibilidad de rankings locales y globales.',
          items: [
            { label: 'Leaderboard activo', enabled: true },
            { label: 'Ranking global activo', enabled: true },
          ],
        },
      ],
      commands: [
        '.daily', '.work', '.salary', '.collect',
        '.balance', '.deposit', '.withdraw', '.give', '.share', '.gift',
        '.fish', '.mine', '.chop',
        '.crime', '.invest',
        '.coinflip', '.roulette', '.slots', '.race', '.carnival',
        '.shop', '.buy', '.sell', '.servershop', '.market', '.auction', '.blackmarket',
        '.bag', '.storage', '.use', '.repair', '.iteminfo', '.craft', '.mix',
        '.pet', '.quest', '.buffs', '.fortune', '.claimcode',
        '.profile', '.setprofile', '.guide', '.moxidex',
        '.leaderboard', '.globalrank', '.trade', '.settings',
      ],
    },
    fun: {
      summary: ['Minijuegos', 'Trivia', 'Apuestas sociales'],
      sections: [
        {
          title: 'Canal y acceso',
          description: 'Define dónde se pueden usar los comandos de diversión y si deben quedar limitados a un canal.',
          items: [
            { label: 'Diversión activa', enabled: true },
            { label: 'Canal de diversión', value: '', kind: 'channel' },
            { label: 'Solo en canal de diversión', enabled: false },
          ],
        },
        {
          title: 'Juegos rápidos',
          description: 'Activa o desactiva minijuegos de respuesta inmediata para mantener el chat activo.',
          items: [
            { label: '8ball activo', enabled: true },
            { label: 'Dado activo', enabled: true },
            { label: 'Moneda activa', enabled: true },
            { label: 'Piedra, papel o tijera activo', enabled: true },
          ],
        },
        {
          title: 'Trivia y retos',
          description: 'Controla juegos de preguntas y dinámicas de retos dentro del servidor.',
          items: [
            { label: 'Trivia activa', enabled: true },
            { label: 'Retos activos', enabled: true },
            { label: 'Tiempo por pregunta', value: '20', kind: 'slider', min: 10, max: 90, step: 5, suffix: ' s' },
          ],
        },
        {
          title: 'Cooldown y anti-spam',
          description: 'Evita spam de comandos de diversión limitando su frecuencia de uso.',
          items: [
            { label: 'Cooldown global', value: '5', kind: 'slider', min: 0, max: 30, step: 1, suffix: ' s' },
            { label: 'Bloqueo anti-spam', enabled: true },
          ],
        },
      ],
      commands: [
        '.8ball', '.roll', '.coinflip', '.rps',
        '.trivia', '.wouldyourather', '.meme',
        '/8ball', '/roll', '/coinflip', '/rps', '/trivia',
      ],
    },
    genshin: {
      summary: ['Perfiles', 'Resina', 'Builds'],
      sections: [
        {
          title: 'Canal y acceso',
          description: 'Define dónde se permiten los comandos de Genshin y si estarán limitados a un canal dedicado.',
          items: [
            { label: 'Genshin activo', enabled: true },
            { label: 'Canal de Genshin', value: '', kind: 'channel' },
            { label: 'Solo en canal de Genshin', enabled: false },
          ],
        },
        {
          title: 'Perfil y showcase',
          description: 'Configura comandos de perfil, UID y panel de personajes compartido en el servidor.',
          items: [
            { label: 'Perfil de jugador activo', enabled: true },
            { label: 'Mostrar UID en respuestas', enabled: true },
            { label: 'Permitir showcase público', enabled: true },
          ],
        },
        {
          title: 'Resina y recordatorios',
          description: 'Controla alertas de resina, tareas diarias y recordatorios de dominios/bosses.',
          items: [
            { label: 'Recordatorios de resina', enabled: true },
            { label: 'Límite de alerta de resina', value: '160', kind: 'slider', min: 20, max: 200, step: 10, suffix: ' resina' },
            { label: 'Recordatorios diarios', enabled: true },
          ],
        },
        {
          title: 'Guías y builds',
          description: 'Habilita recomendaciones de builds, armas y artefactos para personajes.',
          items: [
            { label: 'Comandos de build activos', enabled: true },
            { label: 'Build avanzada', enabled: false },
            { label: 'Fuente de guía', value: 'Comunidad', kind: 'select', options: ['Comunidad', 'Meta', 'Mixto'] },
          ],
        },
      ],
      commands: [
        '.genshin', '.uid', '.build', '.artifact', '.weapon',
        '.character', '.resin', '.daily', '.abyss',
        '/genshin perfil', '/genshin uid', '/genshin build', '/genshin resin',
      ],
    },
    music: {
      summary: ['Canal DJ', 'Volumen', 'Auto play', 'Calidad'],
      sections: [
        {
          title: 'Reproducción',
          description: 'Controla el comportamiento del reproductor del servidor.',
          items: [
            { label: 'Auto play', enabled: true },
            { label: 'Volumen por defecto', value: '70', kind: 'slider', min: 0, max: 100, step: 5, suffix: '%' },
            { label: 'Canal DJ', value: '', kind: 'channel' },
            { label: 'Calidad de audio', value: 'Alta', kind: 'select', options: ['Auto', 'Alta', 'Extrema'] },
            { label: 'Fuente por defecto', value: 'YouTube', kind: 'select', options: ['YouTube', 'Spotify', 'SoundCloud'] },
          ],
        },
        {
          title: 'Permisos del player',
          description: 'Limita quién puede saltar canciones o vaciar la cola.',
          items: [
            { label: 'Solo DJ puede skip', enabled: false },
            { label: 'Solicitudes públicas', enabled: true },
            { label: 'Modo 24/7', enabled: false },
            { label: 'Límite de cola', value: '100', kind: 'text' },
            { label: 'Cooldown entre canciones', value: '3', kind: 'slider', min: 0, max: 10, step: 1, suffix: ' s' },
          ],
        },
      ],
      commands: ['/play', '/skip', '/queue', '/volume', '/247'],
    },
    tickets: {
      summary: ['Panel de soporte', 'Categorías', 'Transcripts'],
      sections: [
        {
          title: 'Apertura de tickets',
          description: 'Define dónde se publica el panel y cómo se organizan los tickets.',
          items: [
            { label: 'Panel activo', enabled: true },
            { label: 'Canal del panel', value: '', kind: 'channel' },
            { label: 'Categoría destino', value: 'Tickets', kind: 'text' },
          ],
        },
        {
          title: 'Cierre y seguimiento',
          description: 'Configura el cierre automático y el registro de conversaciones.',
          items: [
            { label: 'Transcripts', enabled: true },
            { label: 'Auto cierre', enabled: false },
            { label: 'Canal de registros', value: '', kind: 'channel' },
          ],
        },
      ],
      commands: ['/ticket setup', '/ticket close', '/ticket add'],
    },
    roleplay: {
      summary: ['Interacciones', 'Contadores', 'Cooldowns'],
      sections: [
        {
          title: 'Interacciones sociales',
          description: 'Controla cómo funcionan hugs, kisses, pats y demás respuestas.',
          items: [
            { label: 'Respuestas NSFW bloqueadas', enabled: true },
            { label: 'Cooldown global', value: '5 s', kind: 'text' },
            { label: 'Canal recomendado', value: '', kind: 'channel' },
          ],
        },
        {
          title: 'Rankings y perfiles',
          description: 'Activa métricas de interacción entre miembros.',
          items: [
            { label: 'Ranking de acciones', enabled: true },
            { label: 'Perfil social', enabled: true },
            { label: 'Reset mensual', enabled: false },
          ],
        },
      ],
      commands: ['/hug', '/kiss', '/profile'],
    },
    streaming: {
      summary: ['Alertas de stream', 'Canal de alertas', 'Eventos'],
      sections: [
        {
          title: 'Alertas de streaming',
          description: 'Notifica al servidor cuando un miembro empieza, está en vivo o termina un stream.',
          items: [
            { label: 'Alertas activas', enabled: true },
            { label: 'Canal de alertas', value: '', kind: 'channel' },
          ],
        },
        {
          title: 'Eventos',
          description: 'Elige qué eventos de streaming generan una notificación.',
          items: [
            { label: 'Notificar inicio de stream', enabled: true },
            { label: 'Notificar stream en vivo', enabled: true },
            { label: 'Notificar fin de stream', enabled: false },
          ],
        },
      ],
      commands: ['.streaming', '.setalerts', '.streamchannel'],
    },
    matrimonio: {
      summary: ['Propuestas', 'Aniversarios', 'Árbol familiar'],
      sections: [
        {
          title: 'Canal y acceso',
          description: 'Activa el módulo y define el canal donde se enviarán los anuncios de bodas y aniversarios.',
          items: [
            { label: 'Matrimonio activo', enabled: true },
            { label: 'Canal de anuncios', value: '', kind: 'channel' },
            { label: 'Solo en canal de matrimonio', enabled: false },
          ],
        },
        {
          title: 'Propuestas',
          description: 'Configura el comportamiento de las propuestas de matrimonio entre miembros.',
          items: [
            { label: 'Propuestas activas', enabled: true },
            { label: 'Timeout de propuesta', value: '48', kind: 'slider', min: 1, max: 168, step: 1, suffix: ' h' },
            { label: 'Permitir fecha de aniversario personalizada', enabled: true },
          ],
        },
        {
          title: 'Aniversarios',
          description: 'Controla si el bot felicita a las parejas en su aniversario y dónde lo anuncia.',
          items: [
            { label: 'Aniversarios activos', enabled: true },
            { label: 'Anunciar aniversarios', enabled: true },
          ],
        },
        {
          title: 'Árbol familiar',
          description: 'Permite a los miembros ver el árbol de relaciones del servidor.',
          items: [
            { label: 'Árbol familiar activo', enabled: true },
          ],
        },
        {
          title: 'Divorcios',
          description: 'Controla si los usuarios pueden divorciarse y si requiere confirmación mutua.',
          items: [
            { label: 'Divorcios permitidos', enabled: true },
            { label: 'Requiere confirmación mutua', enabled: false },
          ],
        },
      ],
      commands: [
        '.marry', '.acceptmarriage', '.declinemarriage', '.divorce',
        '.marriage', '.anniversary', '.letter', '.marriages',
        '.proposals', '.teammate', '.tree',
        '/marriage proponer', '/marriage aceptar', '/marriage divorcio',
        '/marriage aniversario', '/marriage estado', '/marriage arbol',
      ],
    },
    utilities: {
      summary: ['Herramientas', 'Info', 'Automatización'],
      sections: [
        {
          title: 'Utilidades rápidas',
          description: 'Agrupa funciones de traducción, clima, avatar y consultas rápidas.',
          items: [
            { label: 'Traductor', enabled: true },
            { label: 'Comandos informativos', enabled: true },
            { label: 'Respuesta efímera', enabled: false },
          ],
        },
        {
          title: 'Acciones automáticas',
          description: 'Pequeñas automatizaciones para tareas del día a día.',
          items: [
            { label: 'Recordatorios', enabled: true },
            { label: 'AFK global', enabled: true },
            { label: 'Canal utilidades', value: '', kind: 'channel' },
          ],
        },
      ],
      commands: ['/afk', '/userinfo', '/translate'],
    },
  };

  return presets[moduleId] ?? {
    summary: ['Panel dedicado', 'Permisos', 'Comandos'],
    sections: [
      {
        title: 'Configuración general',
        description: 'Ajusta la activación del módulo y su comportamiento principal en este servidor.',
        items: [
          { label: 'Módulo activo', enabled: true },
          { label: 'Canal principal', value: '', kind: 'channel' },
          { label: 'Modo recomendado', value: 'Estándar', kind: 'select', options: ['Estándar', 'Estricto', 'Flexible'] },
        ],
      },
      {
        title: 'Permisos',
        description: 'Define quién puede ejecutar este módulo y dónde se puede usar.',
        items: [
          { label: 'Solo staff', enabled: false },
          { label: 'Canales restringidos', enabled: false },
          { label: 'Rol permitido', value: '', kind: 'role' },
        ],
      },
    ],
    commands: ['/help', '/config', '/setup'],
  };
}

export function ModuleConfigPage() {
  const { guildId, moduleId } = useParams<{ guildId: string; moduleId: string }>();
  const { user, guilds, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { modules: moduleMeta } = useModules();
  const guild = guilds.find((g) => g.id === guildId);
  const safeModuleId = normalizeModuleId(moduleId ?? 'module');
  const moduleNameKey = `server.modules.${safeModuleId}.name`;
  const moduleDescKey = `server.modules.${safeModuleId}.description`;
  const moduleNameText = t(moduleNameKey);
  const moduleDescText = t(moduleDescKey);
  const moduleName = moduleNameText === moduleNameKey ? prettyModuleName(safeModuleId) : moduleNameText;
  const moduleDesc = moduleDescText === moduleDescKey ? t('server.modulesDesc') : moduleDescText;
  const moduleDef = moduleMeta.find((m) => m.id === safeModuleId);
  const ModuleIcon = moduleDef?.Icon;
  const bgTheme = useMemo(() => getDashboardBackgroundTheme(`${guildId ?? 'server'}-${safeModuleId}-config`), [guildId, safeModuleId]);
  const preset = useMemo(() => buildModulePreset(safeModuleId), [safeModuleId]);
  const [localToggles, setLocalToggles] = useState<Record<string, boolean>>(() => buildInitialValues(buildModulePreset(safeModuleId)).toggles);
  const [localValues, setLocalValues] = useState<Record<string, string>>(() => buildInitialValues(buildModulePreset(safeModuleId)).values);
  const [savedSnapshot, setSavedSnapshot] = useState<{ toggles: Record<string, boolean>; values: Record<string, string> } | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [musicPanelPreview, setMusicPanelPreview] = useState<MusicPanelPreview | null>(null);
  const [musicPanelLoading, setMusicPanelLoading] = useState(false);
  const [moduleCommands, setModuleCommands] = useState<string[]>(preset.commands);
  const [moduleCommandsLoading, setModuleCommandsLoading] = useState(false);
  const [guildChannels, setGuildChannels] = useState<GuildChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [guildRoles, setGuildRoles] = useState<GuildRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [activeMemberCardId, setActiveMemberCardId] = useState<string>('');

  useEffect(() => {
    const initial = buildInitialValues(preset);
    setLocalToggles(initial.toggles);
    setLocalValues(initial.values);
    setSaveState('idle');
    setModuleCommands(preset.commands);
  }, [preset]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    if (guildId && !guilds.find((g) => g.id === guildId)) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, guildId, guilds, navigate]);

  useEffect(() => {
    if (safeModuleId !== 'music' || !guildId) {
      setMusicPanelPreview(null);
      setMusicPanelLoading(false);
      return;
    }

    const controller = new AbortController();
    setMusicPanelLoading(true);

    fetch(`/api/guilds/${guildId}/music-panel`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Music panel API responded ${response.status}`);
        }
        return response.json() as Promise<MusicPanelPreview>;
      })
      .then((data) => {
        setMusicPanelPreview(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('No se pudo cargar el panel de musica:', error);
        setMusicPanelPreview(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMusicPanelLoading(false);
        }
      });

    return () => controller.abort();
  }, [guildId, safeModuleId]);

  useEffect(() => {
    if (!guildId) return;
    const controller = new AbortController();
    setChannelsLoading(true);
    fetch(`/api/guilds/${guildId}/channels`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() as Promise<{ items: GuildChannel[] }> : Promise.reject(r.status))
      .then((data) => setGuildChannels(Array.isArray(data?.items) ? data.items : []))
      .catch((err) => { if (!controller.signal.aborted) console.error('channels error', err); })
      .finally(() => { if (!controller.signal.aborted) setChannelsLoading(false); });
    return () => controller.abort();
  }, [guildId]);

  useEffect(() => {
    if (!guildId) return;
    const controller = new AbortController();
    setRolesLoading(true);
    fetch(`/api/guilds/${guildId}/roles`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() as Promise<{ items: GuildRole[] }> : Promise.reject(r.status))
      .then((data) => setGuildRoles(Array.isArray(data?.items) ? data.items : []))
      .catch((err) => { if (!controller.signal.aborted) console.error('roles error', err); })
      .finally(() => { if (!controller.signal.aborted) setRolesLoading(false); });
    return () => controller.abort();
  }, [guildId]);

  useEffect(() => {
    if (!guildId) return;
    const controller = new AbortController();
    setMembersLoading(true);
    fetch(`/api/guilds/${guildId}/members?limit=100`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() as Promise<{ items: GuildMember[] }> : Promise.reject(r.status))
      .then((data) => setGuildMembers(Array.isArray(data?.items) ? data.items : []))
      .catch((err) => { if (!controller.signal.aborted) console.error('members error', err); })
      .finally(() => { if (!controller.signal.aborted) setMembersLoading(false); });
    return () => controller.abort();
  }, [guildId]);

  // Cargar configuración real guardada del bot (solo módulos con API real)
  useEffect(() => {
    if (!guildId) return;
    const endpoints: Partial<Record<string, string>> = {
      economy: `/api/guilds/${guildId}/economy-settings`,
      matrimonio: `/api/guilds/${guildId}/marriage-settings`,
    };
    const endpoint = endpoints[safeModuleId];
    if (!endpoint) {
      try {
        const raw = localStorage.getItem(moduleLocalConfigKey(guildId, safeModuleId));
        if (!raw) return;
        const parsed = JSON.parse(raw) as { toggles?: Record<string, boolean>; values?: Record<string, string> };
        const mergedToggles: Record<string, boolean> = {
          ...buildInitialValues(preset).toggles,
          ...(parsed?.toggles ?? {}),
        };
        const mergedValues: Record<string, string> = {
          ...buildInitialValues(preset).values,
          ...(parsed?.values ?? {}),
        };
        setLocalToggles(mergedToggles);
        setLocalValues(mergedValues);
        setSavedSnapshot({ toggles: mergedToggles, values: mergedValues });
      } catch {
        // Si falla parseo local, usamos defaults del preset
      }
      return;
    }

    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Record<string, unknown>) => {
        if (controller.signal.aborted) return;
        const mergedToggles: Record<string, boolean> = { ...buildInitialValues(preset).toggles };
        const mergedValues: Record<string, string> = { ...buildInitialValues(preset).values };

        if (safeModuleId === 'economy') {
          if (typeof data.enabled === 'boolean') mergedToggles['Economía activa'] = data.enabled;
          if (typeof data.exclusive === 'boolean') mergedToggles['Solo en canal de economía'] = data.exclusive;
          if (data.channelId) mergedValues['Canal de economía'] = String(data.channelId);
        }

        if (safeModuleId === 'matrimonio') {
          if (typeof data.enabled === 'boolean') mergedToggles['Matrimonio activo'] = data.enabled;
          if (typeof data.exclusive === 'boolean') mergedToggles['Solo en canal de matrimonio'] = data.exclusive;
          if (typeof data.proposalsEnabled === 'boolean') mergedToggles['Propuestas activas'] = data.proposalsEnabled;
          if (typeof data.customAnniversaryEnabled === 'boolean') mergedToggles['Permitir fecha de aniversario personalizada'] = data.customAnniversaryEnabled;
          if (typeof data.anniversariesEnabled === 'boolean') mergedToggles['Aniversarios activos'] = data.anniversariesEnabled;
          if (typeof data.announceAnniversaries === 'boolean') mergedToggles['Anunciar aniversarios'] = data.announceAnniversaries;
          if (typeof data.treeEnabled === 'boolean') mergedToggles['Árbol familiar activo'] = data.treeEnabled;
          if (typeof data.divorcesEnabled === 'boolean') mergedToggles['Divorcios permitidos'] = data.divorcesEnabled;
          if (typeof data.divorceMutualConfirm === 'boolean') mergedToggles['Requiere confirmación mutua'] = data.divorceMutualConfirm;
          if (data.channelId) mergedValues['Canal de anuncios'] = String(data.channelId);
          if (typeof data.proposalTimeoutHours === 'number') mergedValues['Timeout de propuesta'] = String(data.proposalTimeoutHours);
        }

        setLocalToggles(mergedToggles);
        setLocalValues(mergedValues);
        setSavedSnapshot({ toggles: mergedToggles, values: mergedValues });
      })
      .catch(() => {
        // Si el bot no responde, dejamos los defaults del preset
      });
    return () => controller.abort();
  }, [guildId, safeModuleId, preset]);

  useEffect(() => {
    const controller = new AbortController();
    setModuleCommandsLoading(true);

    fetch('/api/commands?limit=5000', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Commands API responded ${response.status}`);
        }
        return response.json() as Promise<{ items?: ApiCommand[] }>;
      })
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        const seen = new Set<string>();
        const filtered = items
          .filter((command) => normalizeModuleId(command.category ?? '') === safeModuleId)
          .flatMap((command) => {
            const commandName = String(command.name ?? '').trim();
            const baseLabel = !commandName
              ? []
              : [command.type === 'slash' ? `/${commandName}` : `.${commandName}`];

            const subcommandLabels = Array.isArray(command.subcommands)
              ? command.subcommands
                  .map((subcommand) => {
                    const fullName = String(subcommand?.fullName ?? '').trim();
                    if (fullName) return `/${fullName}`;
                    const subName = String(subcommand?.name ?? '').trim();
                    return subName && command.type === 'slash' && commandName
                      ? `/${commandName} ${subName}`
                      : '';
                  })
                  .filter(Boolean)
              : [];

            return [...baseLabel, ...subcommandLabels];
          })
          .filter((label) => {
            if (!label || seen.has(label)) return false;
            seen.add(label);
            return true;
          });

        setModuleCommands(filtered.length ? filtered : preset.commands);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('No se pudieron cargar los comandos del modulo:', error);
        setModuleCommands(preset.commands);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setModuleCommandsLoading(false);
        }
      });

    return () => controller.abort();
  }, [preset.commands, safeModuleId]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!guild) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>{t('server.notFound')}</p>
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('server.backToPanel')}
          </Link>
        </Button>
      </main>
    );
  }

  if (!moduleId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Módulo no encontrado</p>
        <Button variant="outline" asChild>
          <Link to={`/dashboard/servers/${guildId}`}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver
          </Link>
        </Button>
      </main>
    );
  }

  const handleToggle = (label: string, value: boolean) => {
    setLocalToggles((prev) => ({ ...prev, [label]: value }));
    setSaveState('idle');
  };

  const handleValueChange = (label: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [label]: value }));
    setSaveState('idle');
  };

  const handleReset = () => {
    const base = savedSnapshot ?? buildInitialValues(preset);
    setLocalToggles(base.toggles);
    setLocalValues(base.values);
    setSaveState('idle');
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      const modulesWithRemoteSave = new Set(['economy', 'moderation', 'streaming', 'matrimonio']);

      if (safeModuleId === 'economy') {
        const channelRaw = (localValues['Canal de economía'] ?? '').trim();
        const payload: Record<string, unknown> = {
          enabled: Boolean(localToggles['Economía activa'] ?? true),
          channelId: channelRaw || null,
          exclusive: Boolean(localToggles['Solo en canal de economía'] ?? false),
        };
        const res = await fetch(`/api/guilds/${guildId}/economy-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      if (safeModuleId === 'moderation') {
        const payload: Record<string, unknown> = {
          enabled: Boolean(localToggles['Logs activos'] ?? true),
          channelId: (localValues['Canal de logs'] ?? '') || null,
        };
        const res = await fetch(`/api/guilds/${guildId}/moderation-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      if (safeModuleId === 'streaming') {
        const payload: Record<string, unknown> = {
          enabled: Boolean(localToggles['Alertas activas'] ?? true),
          channelId: (localValues['Canal de alertas'] ?? '') || null,
          notify_start: Boolean(localToggles['Notificar inicio de stream'] ?? true),
          notify_live: Boolean(localToggles['Notificar stream en vivo'] ?? true),
          notify_end: Boolean(localToggles['Notificar fin de stream'] ?? false),
        };
        const res = await fetch(`/api/guilds/${guildId}/streaming-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      if (safeModuleId === 'matrimonio') {
        const channelRaw = (localValues['Canal de anuncios'] ?? '').trim();
        const timeoutRaw = parseInt(localValues['Timeout de propuesta'] ?? '48', 10);
        const payload: Record<string, unknown> = {
          enabled: Boolean(localToggles['Matrimonio activo'] ?? true),
          channelId: channelRaw || null,
          exclusive: Boolean(localToggles['Solo en canal de matrimonio'] ?? false),
          proposalsEnabled: Boolean(localToggles['Propuestas activas'] ?? true),
          proposalTimeoutHours: isNaN(timeoutRaw) ? 48 : timeoutRaw,
          customAnniversaryEnabled: Boolean(localToggles['Permitir fecha de aniversario personalizada'] ?? true),
          anniversariesEnabled: Boolean(localToggles['Aniversarios activos'] ?? true),
          announceAnniversaries: Boolean(localToggles['Anunciar aniversarios'] ?? true),
          treeEnabled: Boolean(localToggles['Árbol familiar activo'] ?? true),
          divorcesEnabled: Boolean(localToggles['Divorcios permitidos'] ?? true),
          divorceMutualConfirm: Boolean(localToggles['Requiere confirmación mutua'] ?? false),
        };
        const res = await fetch(`/api/guilds/${guildId}/marriage-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      if (!modulesWithRemoteSave.has(safeModuleId) && guildId) {
        localStorage.setItem(
          moduleLocalConfigKey(guildId, safeModuleId),
          JSON.stringify({ toggles: localToggles, values: localValues })
        );
      }

      setSaveState('saved');
      setSavedSnapshot({ toggles: { ...localToggles }, values: { ...localValues } });
      toast.success('Configuración guardada');
    } catch {
      setSaveState('idle');
      toast.error('No se pudo guardar la configuración');
    }
  };

  return (
    <main className="min-h-screen">
      <div className="relative overflow-hidden pb-16 pt-32" style={bgTheme.containerStyle}>
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/3 w-96 h-96 rounded-full blur-3xl" style={bgTheme.blobOneStyle} />
          <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl" style={bgTheme.blobTwoStyle} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Link
              to={`/dashboard/servers/${guildId}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              {guild.name}
            </Link>

            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${moduleDef?.configColor ?? 'from-slate-500 to-slate-600'} text-white`}>
                {ModuleIcon && <ModuleIcon className="w-8 h-8" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{moduleName}</h1>
                <p className="text-muted-foreground">{moduleDesc}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mb-8 flex flex-wrap items-center gap-2"
          >
            {preset.summary.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-foreground/80 backdrop-blur"
              >
                {chip}
              </span>
            ))}
            <div className="ml-auto flex items-center gap-2">
              {saveState === 'saved' && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
                  Cambios guardados
                </span>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
                Restablecer
              </Button>
              <Button size="sm" className="gap-2" onClick={handleSave} disabled={saveState === 'saving'}>
                <Save className="w-4 h-4" />
                {saveState === 'saving' ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]"
          >
            <div className="space-y-6">
              {preset.sections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <h2 className="mb-2 text-xl font-semibold text-foreground">{section.title}</h2>
                  <p className="mb-5 text-sm text-muted-foreground">{section.description}</p>

                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const toggleValue = localToggles[item.label] ?? item.enabled ?? false;
                      const isToggle = typeof item.enabled === 'boolean';
                      const fieldValue = localValues[item.label] ?? item.value ?? '';
                      const fieldKind = item.kind ?? 'text';
                      const isSlider = fieldKind === 'slider';

                      return (
                        <div
                          key={item.label}
                          className={`rounded-xl border border-white/10 bg-black/10 px-4 ${isSlider ? 'py-4' : 'py-3'}`}
                        >
                          {isSlider ? (
                            <div>
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                  {fieldValue}{item.suffix ?? ''}
                                </span>
                              </div>
                              <Slider
                                value={[Number(fieldValue || item.min || 0)]}
                                min={item.min ?? 0}
                                max={item.max ?? 100}
                                step={item.step ?? 1}
                                onValueChange={(value) => handleValueChange(item.label, String(value[0] ?? 0))}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              {isToggle ? (
                                <Switch
                                  checked={toggleValue}
                                  onCheckedChange={(checked) => handleToggle(item.label, checked)}
                                  className="data-[state=checked]:bg-green-500 shrink-0"
                                />
                              ) : fieldKind === 'channel' ? (
                                <Select
                                  value={fieldValue || '__none__'}
                                  onValueChange={(value) => handleValueChange(item.label, value === '__none__' ? '' : value)}
                                >
                                  <SelectTrigger className="w-52 shrink-0 border-white/10 bg-white/5">
                                    <SelectValue placeholder={channelsLoading ? 'Cargando…' : 'Sin canal'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__">— Ninguno —</SelectItem>
                                    {guildChannels.map((ch) => (
                                      <SelectItem key={ch.id} value={ch.id}>
                                        #{ch.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : fieldKind === 'role' ? (
                                <Select
                                  value={fieldValue || '__none__'}
                                  onValueChange={(value) => handleValueChange(item.label, value === '__none__' ? '' : value)}
                                >
                                  <SelectTrigger className="w-52 shrink-0 border-white/10 bg-white/5">
                                    <SelectValue placeholder={rolesLoading ? 'Cargando…' : 'Sin rol'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__">— Ninguno —</SelectItem>
                                    {guildRoles.map((role) => (
                                      <SelectItem key={role.id} value={role.id}>
                                        {role.color !== 0 && (
                                          <span
                                            className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 shrink-0"
                                            style={{ backgroundColor: `#${role.color.toString(16).padStart(6, '0')}` }}
                                          />
                                        )}
                                        @{role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : fieldKind === 'user' ? (
                                <div className="w-[30rem] max-w-full shrink-0 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {membersLoading ? 'Cargando usuarios…' : `${guildMembers.length} usuarios`}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleValueChange(item.label, '')}
                                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      Limpiar
                                    </button>
                                  </div>
                                  <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-2 sm:grid-cols-2">
                                    {guildMembers.map((m) => {
                                      const selected = fieldValue === m.id;
                                      const avatarUrl = m.avatar
                                        ? `https://cdn.discordapp.com/avatars/${m.id}/${m.avatar}.png?size=64`
                                        : null;
                                      return (
                                        <button
                                          key={m.id}
                                          type="button"
                                          onClick={() => handleValueChange(item.label, m.id)}
                                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${selected
                                            ? 'border-emerald-400/60 bg-emerald-500/15'
                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                        >
                                          {avatarUrl ? (
                                            <img src={avatarUrl} alt={m.username} className="h-7 w-7 rounded-full object-cover" />
                                          ) : (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold uppercase text-muted-foreground">
                                              {m.displayName?.charAt(0) || m.username?.charAt(0) || 'U'}
                                            </div>
                                          )}
                                          <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-foreground">{m.displayName || m.username}</p>
                                            {m.displayName !== m.username && (
                                              <p className="truncate text-[11px] text-muted-foreground">@{m.username}</p>
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                    {!membersLoading && guildMembers.length === 0 && (
                                      <p className="col-span-full px-2 py-3 text-center text-xs text-muted-foreground">
                                        No hay usuarios disponibles.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : fieldKind === 'select' ? (
                                <Select value={fieldValue} onValueChange={(value) => handleValueChange(item.label, value)}>
                                  <SelectTrigger className="w-44 shrink-0 border-white/10 bg-white/5">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(item.options ?? []).map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={fieldValue}
                                  onChange={(event) => handleValueChange(item.label, event.target.value)}
                                  className="w-36 shrink-0 border-white/10 bg-white/5 text-right text-sm"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {safeModuleId === 'moderation' && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="mb-1 text-xl font-semibold text-foreground">Usuarios del servidor</h2>
                      <p className="text-sm text-muted-foreground">
                        Lista rápida en formato fichas para identificar y seleccionar miembros.
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/70">
                      {membersLoading ? 'Cargando…' : `${guildMembers.length} usuarios`}
                    </span>
                  </div>

                  <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-white/10 bg-black/10 p-2 sm:grid-cols-2">
                    {guildMembers.map((m) => {
                      const selected = activeMemberCardId === m.id;
                      const avatarUrl = m.avatar
                        ? `https://cdn.discordapp.com/avatars/${m.id}/${m.avatar}.png?size=96`
                        : null;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setActiveMemberCardId((prev) => (prev === m.id ? '' : m.id))}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${selected
                            ? 'border-emerald-400/60 bg-emerald-500/15'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={m.username} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-muted-foreground">
                              {m.displayName?.charAt(0) || m.username?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{m.displayName || m.username}</p>
                            <p className="truncate text-xs text-muted-foreground">@{m.username}</p>
                          </div>
                        </button>
                      );
                    })}

                    {!membersLoading && guildMembers.length === 0 && (
                      <p className="col-span-full px-2 py-4 text-center text-xs text-muted-foreground">
                        No hay usuarios disponibles para mostrar.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {safeModuleId === 'music' && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="mb-1 text-xl font-semibold text-foreground">Panel real del bot</h2>
                      <p className="text-sm text-muted-foreground">
                        Vista previa del panel fijo que ya tiene Moxi dentro de Discord.
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${musicPanelPreview?.state === 'active' ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border border-white/10 bg-white/5 text-foreground/70'}`}>
                      {musicPanelPreview?.state === 'active' ? 'Activo' : 'En espera'}
                    </span>
                  </div>

                  {musicPanelLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-muted-foreground">
                      Cargando panel del bot...
                    </div>
                  ) : musicPanelPreview?.panel ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/90">
                      <div className="border-b border-white/10 px-4 py-3">
                        <div className="text-sm font-semibold text-white/90">
                          {(musicPanelPreview.panel.title ?? 'Panel de musica').replace(/^##\s*/, '')}
                        </div>
                      </div>

                      {musicPanelPreview.panel.imageUrl && (
                        <div className="border-b border-white/10 p-3">
                          <img
                            src={musicPanelPreview.panel.imageUrl}
                            alt="Panel de música"
                            className="h-40 w-full rounded-xl object-cover"
                          />
                        </div>
                      )}

                      <div className="space-y-4 p-4">
                        <div className="whitespace-pre-line text-sm leading-6 text-white/80">
                          {musicPanelPreview.panel.info}
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                          {['Repetir', 'Pausar', 'Skip', 'Cola', 'Auto'].map((label) => (
                            <Button key={label} variant="outline" size="sm" disabled className="border-white/10 bg-white/5 text-white/70">
                              {label}
                            </Button>
                          ))}
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/70">
                          Filtro de audio{musicPanelPreview.panel.activeFilter ? `: ${musicPanelPreview.panel.activeFilter}` : ''}
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                          {['-10s', 'Vol -', 'Vol +', '+10s', 'Stop'].map((label) => (
                            <Button key={label} variant="outline" size="sm" disabled className="border-white/10 bg-white/5 text-white/70">
                              {label}
                            </Button>
                          ))}
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-3 text-xs text-white/50">
                          {musicPanelPreview.panel.footerText}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-muted-foreground">
                      No pude cargar el panel del bot para este servidor.
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                      <span>Configurado en Discord</span>
                      <span className="font-medium text-foreground">{musicPanelPreview?.configured ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                      <span>Canal</span>
                      <span className="font-medium text-foreground">{musicPanelPreview?.panel?.channelId ? `#${musicPanelPreview.panel.channelId}` : 'Sin asignar'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-2 text-xl font-semibold text-foreground">Comandos del módulo</h2>
                <p className="mb-5 text-sm text-muted-foreground">
                  {moduleCommandsLoading
                    ? 'Cargando comandos reales del bot para este módulo.'
                    : 'Estos comandos se cargan automáticamente desde el bot para esta categoría.'}
                </p>

                <div className="flex flex-wrap gap-2">
                  {moduleCommands.map((command) => (
                    <span
                      key={command}
                      className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {command}
                    </span>
                  ))}
                </div>

                <Button className="mt-5 gap-2" variant="outline">
                  Ver documentación <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-2 text-xl font-semibold text-foreground">Estado de configuración</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Un resumen rápido de lo que ya está listo para este módulo en el servidor.
                </p>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                    <span>Panel cargado</span>
                    <span className="font-medium text-emerald-400">Listo</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                    <span>Servidor</span>
                    <span className="font-medium text-foreground">{guild.name}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                    <span>Módulo</span>
                    <span className="font-medium text-foreground">{moduleName}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
