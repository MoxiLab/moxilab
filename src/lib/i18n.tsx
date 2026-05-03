import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const DEFAULT_LANGUAGE = 'es' as const;
const STORAGE_KEY = 'moxi_lang';

const translations = {
  es: {
    common: {
      addBot: 'Agregar el bot',
      manageServers: 'Administrar servidores',
      premium: 'Premium',
      login: 'Iniciar sesion',
      invite: 'Invitar',
      support: 'Soporte',
      viewAll: 'Ver todo',
    },
    header: {
      nav: {
        commands: 'Comandos',
        modules: 'Modulos',
        resources: 'Recursos',
      },
      modules: {
        welcome: 'Bienvenida',
        roleplay: 'Roleplay',
        currency: 'Economia',
        utilities: 'Utilidades',
        moderation: 'Moderacion',
      },
      resources: {
        documentation: 'Documentacion',
        commands: 'Comandos',
        gallery: 'Galeria',
        support: 'Soporte',
      },
      theme: {
        light: 'Cambiar a modo claro',
        dark: 'Cambiar a modo oscuro',
      },
    },
    hero: {
      badge: 'El bot mas tierno',
      title: 'Tu adorable companera Moxi para Discord',
      description:
        'Crea una comunidad vibrante con el bot anime todo en uno. Economia, roleplay, musica y administracion en un solo lugar. Simple, adorable y pensado para conectar.',
      imageAlt: 'Moxi - Tu adorable companera Moxi',
    },
    trustedBy: {
      kicker: 'Con la confianza de',
      headingPrefix: 'mas de',
      million: 'millones',
      headingSuffix: 'servidores',
      description: 'Hecho con amor para comunidades de Discord en todo el mundo',
    },
    welcomeMessages: {
      title: 'Mensajes de bienvenida',
      description1:
        'Moxi puede personalizar mensajes de bienvenida, despedida y boosts para mejorar tu servidor.',
      description2:
        'Puedes personalizar los mensajes con multiples variables para crear mensajes unicos y hermosos. Con Moxi en tu servidor, todos se sentiran bienvenidos.',
      link: 'Conoce mas sobre los mensajes de bienvenida',
      mockup: {
        line1: 'Bienvenido al servidor!',
        line2Prefix: 'Espero que disfrutes tu estadia,',
        line2Middle: 'Ahora somos',
        line2Suffix: 'miembros.',
      },
    },
    roleplay: {
      title: 'Roleplay',
      description1:
        'Con mas de 100 comandos y 10,000 gifs de abrazos, palmaditas, mordidas y mas, Moxi es el bot con mayor variedad de comandos de roleplay.',
      description2:
        'Moxi tiene contadores para que veas cuantas veces has recibido abrazos, besos, palmaditas y mas. Los gifs han sido seleccionados cuidadosamente para garantizar la mejor experiencia para sus miembros y para todas las edades.',
      link: 'Conoce mas sobre Roleplay',
      mockup: {
        hugVerb: 'da un abrazo a',
        gifLabel: 'Gif de abrazo anime',
        timesHugged: 'Abrazos recibidos:',
      },
    },
    currency: {
      title: 'Economia',
      ranking: 'Ranking global',
      description1:
        'Moxi tiene un sistema global de economia completo que fomenta la interaccion entre los miembros del servidor.',
      description2:
        'Niveles, balances, mascotas, clubs, matrimonios y mucho mas. La economia de Moxi es muy completa y divertida.',
      description3:
        'Cada dos meses se activan eventos globales en los que puedes ganar items exclusivos. Sube en los rankings y llega a la cima de la economia global.',
      link: 'Conoce mas sobre Economia',
    },
    utilities: {
      title: 'Utilidades',
      description1: 'Moxi puede realizar tareas automaticas y de entretenimiento para tu servidor.',
      description2:
        'Te da ansiedad el proximo episodio de tu anime favorito? Moxi puede avisarte cuando sale.',
      description3:
        'Auto posts de waifus, notificaciones de anime, proteccion del servidor y mas. Moxi lo hace todo.',
      link: 'Conoce mas sobre Utilidades',
      mockup: {
        newEpisode: 'Nuevo episodio disponible',
        episodeTitle: 'Episodio 8 - Nada busca, nada encuentra',
        watchEpisode: 'Ver episodio',
        protectionTitle: 'Proteccion del servidor',
        protectionBody:
          'Anti-spam activado. Tu servidor esta protegido contra enlaces de invitacion no autorizados.',
      },
    },
    featuresGrid: {
      title: 'El bot todo en uno',
      subtitle: 'Moxi lo hace todo',
      items: {
        anime: 'Anime',
        roleplay: 'Roleplay',
        starboard: 'Starboard',
        giveaways: 'Sorteos',
        birthdays: 'Cumpleanos',
        levels: 'Niveles',
        currency: 'Economia',
        pets: 'Mascotas',
        marriages: 'Matrimonios',
        moderation: 'Moderacion',
        logs: 'Logs',
        fun: 'Diversion',
        configuration: 'Configuracion',
        utilities: 'Utilidades',
        more: 'Y mas...',
      },
    },
    modulesShowcase: {
      badge: 'Modulos pensados para comunidad',
      title: 'Tu server, tu estilo',
      description:
        'En vez de una lista infinita, aqui tienes un mapa claro: que hace Moxi y por que se siente diferente.',
      modules: {
        welcome: {
          title: 'Bienvenida y boosts',
          description:
            'Mensajes de bienvenida, despedida y boosts con variables y estilos personalizados.',
          chips: ['Variables', 'Embeds', 'Auto roles'],
        },
        roleplay: {
          title: 'Roleplay',
          description:
            'Reacciones, gifs y contadores para que la comunidad interactue y se divierta.',
          chips: ['+100 comandos', 'Contadores', 'Para todas las edades'],
        },
        currency: {
          title: 'Economia',
          description:
            'Economia simple y rankings para incentivar actividad y recompensas.',
          chips: ['Rankings', 'Recompensas', 'Balance'],
        },
        utilities: {
          title: 'Utilidades',
          description:
            'Automatizaciones, avisos y herramientas para llevar el server al dia.',
          chips: ['Notificaciones', 'Auto tareas', 'Helpers'],
        },
        moderation: {
          title: 'Moderacion',
          description:
            'Herramientas claras para mantener tu servidor seguro y ordenado.',
          chips: ['Anti-raid', 'Logs', 'Filtros'],
        },
        vibes: {
          title: 'Vibes personalizadas',
          description:
            'Pequenos detalles que hacen que Moxi se sienta "tuya": tonos, respuestas y estilo.',
          chips: ['Personalidad', 'Estilo', 'Consistencia'],
        },
      },
    },
    trustedServers: {
      badge: 'Servidores confiados',
      title: 'Gracias por confiar en Moxi',
      descriptionPrefix: 'Hay',
      descriptionSuffix: 'servidores usando nuestro bot todos los dias',
      verified: 'Verificado',
      members: 'miembros',
    },
    ai: {
      title: 'Conoce a tu nueva amiga',
      subtitle: 'Moxi, ahora con inteligencia artificial',
      listTitle: 'A diferencia de otros bots, Moxi es:',
      features: {
        cute: {
          title: 'Tierna y amigable',
          description: 'Disenada para ser adorable y cercana en cada interaccion',
        },
        adaptive: {
          title: 'Adaptable e inteligente',
          description: 'Se adapta a cada servidor y aprende de las interacciones',
        },
        companion: {
          title: 'Tu companera perfecta',
          description: 'Programada para hacer tu servidor mas divertido y organizado',
        },
      },
      chat: {
        greeting: 'Hola! Soy Moxi :3',
        help: 'En que puedo ayudarte hoy? ✨',
        imageGen: 'Generacion de imagen',
        madeWith: 'Hecho con Moxi',
      },
    },
    wiki: {
      title: 'Tutoriales y guias',
      subtitle: 'Todo lo que necesitas saber esta disponible en su Wiki oficial',
      features: {
        docs: {
          title: 'Documentacion extensa',
          description: 'Mas de 600 comandos documentados en detalle',
        },
        search: {
          title: 'Facil de navegar',
          description: 'Encuentra lo que necesitas rapido con nuestro buscador',
        },
        community: {
          title: 'Impulsado por la comunidad',
          description: 'Actualizaciones regulares de nuestro equipo voluntario',
        },
      },
      button: 'Ir a la Wiki',
    },
    finalCta: {
      title: 'Comenzamos nuestra historia?',
    },
    footer: {
      description: 'Un bot que busca fomentar la actividad en tu servidor.',
      resources: 'Recursos',
      moxi: 'Moxi',
      legal: 'Legal',
      copyright: '© Gwee & Kwee, 2026, Todos los derechos reservados',
      links: {
        patreon: 'Patreon',
        wiki: 'Wiki de Moxi',
        gallery: 'Galeria',
        supportServer: 'Servidor de soporte',
        suggestions: 'Sugerencias',
        reports: 'Reportes',
        partners: 'Partners',
        terms: 'Terminos de servicio',
        privacy: 'Politica de privacidad',
        refund: 'Politica de reembolsos',
      },
    },
    commands: {
      title: 'Comandos',
      subtitle: 'Mira la extensa lista de comandos de Moxi',
      searchPlaceholder: 'Buscar comandos…',
      categories: 'Categorias',
      filters: {
        filterTitle: 'Filtrar',
        all: 'Todos',
        prefix: 'Comandos',
        slash: 'Slashcommands',
      },
      resultsSingle: 'resultado',
      resultsPlural: 'resultados',
      loading: 'Cargando…',
      errors: {
        load:
          'No se pudo cargar la lista desde MongoDB. Inicia el servidor con `npm run dev:full` o `npm run start` y revisa `MONGODB_URI` en tu `.env.local`.',
      },
      labels: {
        usage: 'Uso:',
        aliases: 'Aliases',
        examples: 'Ejemplos',
        subcommands: 'Subcomandos',
        cooldown: 'Cooldown:',
      },
      empty: 'No hay resultados para tu busqueda.',
      category: {
        all: 'Todos',
        other: 'Otros',
      },
    },
    commandPlayground: {
      kicker: 'Toque Moxi: comandos reales',
      title: 'Prueba un comando en 5 segundos',
      description:
        'Esto no es un mock: esta alimentado por la misma lista que se ve en la pagina de Commands.',
      placeholder: 'Escribe: .auction help, /audit on, 8ball…',
      counts: '{total} total · {prefix} prefix · {slash} slash',
      loading: 'Cargando comandos…',
      previewLoading: '· preparando preview…',
      previewQueued: '· preview en cola ({status})',
      previewQueuedStatus: 'en cola',
      errors: {
        load: 'API de MongoDB no disponible. Ejecuta `npm run dev` (o `npm run dev:api`) y recarga.',
        fallback: 'No se pudo cargar desde MongoDB',
      },
      noPreview: 'No hay preview guardado en playground_jobs para este comando.',
      selectPlaceholder: 'Selecciona…',
    },
    discord: {
      preview: 'Vista previa de Moxi',
    },
    dashboard: {
      loading: 'Cargando…',
      signingIn: 'Iniciando sesión…',
      refresh: 'Actualizar',
      logout: 'Cerrar sesión',
      moxiActive: 'Moxi activo',
      serverSingular: 'servidor',
      serverPlural: 'servidores',
      canInvite: 'Puedes invitar Moxi',
      whereAdmin: 'donde eres admin',
      noServers: 'No tienes servidores donde seas administrador.',
      manage: 'Gestionar',
      invite: 'Invitar Moxi',
      moxiHere: 'Moxi está en este servidor',
    },
    server: {
      back: 'Mi panel',
      moxiActive: 'Moxi activo en este servidor',
      notFound: 'Servidor no encontrado o no tienes acceso.',
      backToPanel: 'Volver al panel',
      modulesTitle: 'Módulos disponibles',
      modulesDesc: 'Todos los módulos de Moxi están disponibles en este servidor. La configuración individual por módulo estará disponible próximamente.',
      viewDocs: 'Ver documentación',
      modules: {
        welcome: { name: 'Bienvenidas', description: 'Mensajes personalizados cuando un usuario entra o sale del servidor.' },
        roleplay: { name: 'Roleplay', description: 'Sistema de rol con personajes, acciones y narrativas interactivas.' },
        economy: { name: 'Economía', description: 'Sistema de moneda virtual, tienda, banco y recompensas diarias.' },
        utilities: { name: 'Utilidades', description: 'Herramientas generales: clima, traductor, info de usuario y más.' },
        moderation: { name: 'Moderación', description: 'Baneos, muteos, advertencias, logs y automod configurables.' },
        ai: { name: 'IA & Chat', description: 'Respuestas inteligentes, conversaciones y generación de contenido.' },
        music: { name: 'Música', description: 'Reproduce música desde YouTube, Spotify y más en canales de voz.' },
        giveaways: { name: 'Sorteos', description: 'Crea y gestiona sorteos con reacciones y ganadores automáticos.' },
        tickets: { name: 'Tickets', description: 'Sistema de soporte con canales privados por usuario.' },
        logs: { name: 'Logs', description: 'Registro de ediciones, borrados, entradas/salidas y acciones de mods.' },
        automod: { name: 'AutoMod', description: 'Filtros de palabras, spam, links y menciones masivas automáticos.' },
        wiki: { name: 'Wiki', description: 'Base de conocimiento integrada al servidor con comandos personalizados.' },
      },
    },
  },
  en: {
    common: {
      addBot: 'Add the bot',
      manageServers: 'Manage servers',
      premium: 'Premium',
      login: 'Login',
      invite: 'Invite',
      support: 'Support',
      viewAll: 'View all',
    },
    header: {
      nav: {
        commands: 'Commands',
        modules: 'Modules',
        resources: 'Resources',
      },
      modules: {
        welcome: 'Welcome',
        roleplay: 'Roleplay',
        currency: 'Currency',
        utilities: 'Utilities',
        moderation: 'Moderation',
      },
      resources: {
        documentation: 'Documentation',
        commands: 'Commands',
        gallery: 'Gallery',
        support: 'Support',
      },
      theme: {
        light: 'Switch to light mode',
        dark: 'Switch to dark mode',
      },
    },
    hero: {
      badge: 'The cutest bot',
      title: 'Your adorable Moxi companion for Discord',
      description:
        'Create a vibrant community with the all-in-one anime bot. Currency, roleplay, music, and administration in one place. Simple, adorable, and designed to connect.',
      imageAlt: 'Moxi - Your adorable Moxi companion',
    },
    trustedBy: {
      kicker: 'Trusted by',
      headingPrefix: 'more than',
      million: 'million',
      headingSuffix: 'servers',
      description: 'Built with love for Discord communities around the world',
    },
    welcomeMessages: {
      title: 'Welcome messages',
      description1:
        'Moxi can customize welcome, farewell and boost messages for improving your server.',
      description2:
        'You can customize the messages with multiple variables so you can create unique and beautiful messages. With Moxi in your server, everyone will feel welcome!',
      link: 'Learn more about Welcome messages',
      mockup: {
        line1: 'Welcome to the server!',
        line2Prefix: 'I hope you enjoy your stay,',
        line2Middle: 'We are now',
        line2Suffix: 'members.',
      },
    },
    roleplay: {
      title: 'Roleplay',
      description1:
        'With more than 100 commands and 10,000 gifs ranging from hugs, pats, bites among others, Moxi is the bot with the most variety of roleplay commands.',
      description2:
        'Moxi has counters so you can see how many times you have received hugs, kisses, pats and more. The gifs have been meticulously selected to guarantee the best experience for its members and for all ages.',
      link: 'Learn more about Roleplay',
      mockup: {
        hugVerb: 'gives a hug to',
        gifLabel: 'Anime hug gif',
        timesHugged: 'Times hugged:',
      },
    },
    currency: {
      title: 'Currency',
      ranking: 'Global ranking',
      description1:
        'Moxi has a complete global currency system that encourages interaction between server members.',
      description2:
        "Levels, balances, pets, clubs, marriages and much more. Moxi's currency is very complete and fun.",
      description3:
        'Every two months global events are activated in which you have the opportunity to win exclusive items. Climb the leaderboards and reach the top of the global currency.',
      link: 'Learn more about Currency',
    },
    utilities: {
      title: 'Utilities',
      description1: 'Moxi can perform automatic and entertainment tasks for your server.',
      description2:
        'Are you anxious for the next episode of your favorite anime? Moxi can notify you when it comes out.',
      description3:
        'Auto posting waifus, anime notifications, server protection, among others. Moxi can do it all.',
      link: 'Learn more about Utilities',
      mockup: {
        newEpisode: 'New Episode Available',
        episodeTitle: 'Episode 8 - Nothing seek, nothing find',
        watchEpisode: 'Watch Episode',
        protectionTitle: 'Server Protection',
        protectionBody:
          'Anti-spam enabled. Your server is protected against unauthorized invite links.',
      },
    },
    featuresGrid: {
      title: 'The all in one bot',
      subtitle: 'Moxi does everything',
      items: {
        anime: 'Anime',
        roleplay: 'Roleplay',
        starboard: 'Starboard',
        giveaways: 'Giveaways',
        birthdays: 'Birthdays',
        levels: 'Levels',
        currency: 'Currency',
        pets: 'Pets',
        marriages: 'Marriages',
        moderation: 'Moderation',
        logs: 'Logs',
        fun: 'Fun',
        configuration: 'Configuration',
        utilities: 'Utilities',
        more: 'And more...',
      },
    },
    modulesShowcase: {
      badge: 'Modules built for community',
      title: 'Your server, your style',
      description:
        'Instead of an endless list, here is a clear map: what Moxi does and why it feels different.',
      modules: {
        welcome: {
          title: 'Welcome & Boosts',
          description:
            'Welcome, farewell and boost messages with variables and custom styles.',
          chips: ['Variables', 'Embeds', 'Auto roles'],
        },
        roleplay: {
          title: 'Roleplay',
          description:
            'Reactions, gifs and counters so the community interacts and has fun.',
          chips: ['100+ commands', 'Counters', 'All-ages'],
        },
        currency: {
          title: 'Currency',
          description:
            'Simple economy and rankings to encourage activity and rewards.',
          chips: ['Rankings', 'Rewards', 'Balance'],
        },
        utilities: {
          title: 'Utilities',
          description:
            'Automations, alerts and tools to keep the server up to date.',
          chips: ['Notifications', 'Auto tasks', 'Helpers'],
        },
        moderation: {
          title: 'Moderation',
          description:
            'Clear tools to keep your server safe and organized.',
          chips: ['Anti-raid', 'Logs', 'Filters'],
        },
        vibes: {
          title: 'Custom vibes',
          description:
            'Small details that make Moxi feel "yours": tone, replies and style.',
          chips: ['Personality', 'Style', 'Consistency'],
        },
      },
    },
    trustedServers: {
      badge: 'Trusted servers',
      title: 'Thank you for trusting Moxi',
      descriptionPrefix: 'There are',
      descriptionSuffix: 'servers using our bot every day',
      verified: 'Verified',
      members: 'members',
    },
    ai: {
      title: 'Meet Your New Friend',
      subtitle: 'Moxi, now with artificial intelligence',
      listTitle: 'Unlike other bots, Moxi is:',
      features: {
        cute: {
          title: 'Cute and Friendly',
          description: 'Designed to be adorable and approachable in every interaction',
        },
        adaptive: {
          title: 'Adaptive and Smart',
          description: 'Adapts to each server and learns from interactions',
        },
        companion: {
          title: 'Your Perfect Companion',
          description: 'Programmed to make your server more fun and organized',
        },
      },
      chat: {
        greeting: "Hi! I'm Moxi :3",
        help: 'How can I help you today? ✨',
        imageGen: 'Image generation',
        madeWith: 'Made with Moxi',
      },
    },
    wiki: {
      title: 'Tutorials and guides',
      subtitle: 'Everything you need to know is available on its official Wiki',
      features: {
        docs: {
          title: 'Extensive Documentation',
          description: 'Over 600 commands documented in detail',
        },
        search: {
          title: 'Easy to Navigate',
          description: 'Find what you need quickly with our search feature',
        },
        community: {
          title: 'Community Driven',
          description: 'Regular updates by our volunteer team',
        },
      },
      button: 'Go to the Wiki',
    },
    finalCta: {
      title: 'Shall we begin our story?',
    },
    footer: {
      description: 'A bot that seeks to encourage activity in your server.',
      resources: 'Resources',
      moxi: 'Moxi',
      legal: 'Legal',
      copyright: '© Gwee & Kwee, 2026, All rights reserved',
      links: {
        patreon: 'Patreon',
        wiki: 'Moxi Wiki',
        gallery: 'Gallery',
        supportServer: 'Support server',
        suggestions: 'Suggestions',
        reports: 'Reports',
        partners: 'Partners',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        refund: 'Refund Policy',
      },
    },
    commands: {
      title: 'Commands',
      subtitle: 'See the extensive list of Moxi commands',
      searchPlaceholder: 'Search commands…',
      categories: 'Categories',
      filters: {
        filterTitle: 'Filter',
        all: 'All',
        prefix: 'Commands',
        slash: 'Slash commands',
      },
      resultsSingle: 'result',
      resultsPlural: 'results',
      loading: 'Loading…',
      errors: {
        load:
          'Could not load the list from MongoDB. Start the server with `npm run dev:full` or `npm run start` and check `MONGODB_URI` in your `.env.local`.',
      },
      labels: {
        usage: 'Usage:',
        aliases: 'Aliases',
        examples: 'Examples',
        subcommands: 'Subcommands',
        cooldown: 'Cooldown:',
      },
      empty: 'No results for your search.',
      category: {
        all: 'All',
        other: 'Other',
      },
    },
    commandPlayground: {
      kicker: 'Moxi touch: real commands',
      title: 'Try a command in 5 seconds',
      description:
        'This is not a mock: it is powered by the same list shown on the Commands page.',
      placeholder: 'Type: .auction help, /audit on, 8ball…',
      counts: '{total} total · {prefix} prefix · {slash} slash',
      loading: 'Loading commands…',
      previewLoading: '· preparing preview…',
      previewQueued: '· preview queued ({status})',
      previewQueuedStatus: 'queued',
      errors: {
        load: 'MongoDB API unavailable. Run `npm run dev` (or `npm run dev:api`) and refresh.',
        fallback: 'Could not load from MongoDB',
      },
      noPreview: 'No preview saved in playground_jobs for this command.',
      selectPlaceholder: 'Select…',
    },
    discord: {
      preview: 'Moxi Preview',
    },
    dashboard: {
      loading: 'Loading…',
      signingIn: 'Signing in…',
      refresh: 'Refresh',
      logout: 'Log out',
      moxiActive: 'Moxi active',
      serverSingular: 'server',
      serverPlural: 'servers',
      canInvite: 'You can invite Moxi',
      whereAdmin: "where you're admin",
      noServers: "You have no servers where you're an administrator.",
      manage: 'Manage',
      invite: 'Invite Moxi',
      moxiHere: 'Moxi is in this server',
    },
    server: {
      back: 'My panel',
      moxiActive: 'Moxi active in this server',
      notFound: "Server not found or you don't have access.",
      backToPanel: 'Back to panel',
      modulesTitle: 'Available modules',
      modulesDesc: 'All Moxi modules are available in this server. Individual per-module configuration will be available soon.',
      viewDocs: 'View documentation',
      modules: {
        welcome: { name: 'Welcome', description: 'Custom messages when a user joins or leaves the server.' },
        roleplay: { name: 'Roleplay', description: 'Role system with characters, actions and interactive narratives.' },
        economy: { name: 'Economy', description: 'Virtual currency system, shop, bank and daily rewards.' },
        utilities: { name: 'Utilities', description: 'General tools: weather, translator, user info and more.' },
        moderation: { name: 'Moderation', description: 'Bans, mutes, warnings, logs and configurable automod.' },
        ai: { name: 'AI & Chat', description: 'Smart replies, conversations and content generation.' },
        music: { name: 'Music', description: 'Play music from YouTube, Spotify and more in voice channels.' },
        giveaways: { name: 'Giveaways', description: 'Create and manage giveaways with reactions and automatic winners.' },
        tickets: { name: 'Tickets', description: 'Support system with private channels per user.' },
        logs: { name: 'Logs', description: 'Record of edits, deletions, joins/leaves and mod actions.' },
        automod: { name: 'AutoMod', description: 'Automatic filters for words, spam, links and mass mentions.' },
        wiki: { name: 'Wiki', description: 'Knowledge base integrated into the server with custom commands.' },
      },
    },
  },
  zh: {
    common: {
      addBot: '添加机器人',
      manageServers: '管理服务器',
      premium: '高级版',
      login: '登录',
      invite: '邀请',
      support: '支持',
      viewAll: '查看全部',
    },
    header: {
      nav: {
        commands: '命令',
        modules: '模块',
        resources: '资源',
      },
      modules: {
        welcome: '欢迎',
        roleplay: '角色扮演',
        currency: '经济',
        utilities: '工具',
        moderation: '管理',
      },
      resources: {
        documentation: '文档',
        commands: '命令',
        gallery: '画廊',
        support: '支持',
      },
      theme: {
        light: '切换到浅色模式',
        dark: '切换到深色模式',
      },
    },
    hero: {
      badge: '最可爱的机器人',
      title: '你的可爱 Moxi Discord 伙伴',
      description:
        '用一体化动漫机器人打造活跃社区。经济、角色扮演、音乐和管理一站式完成。简单、可爱、为连接而生。',
      imageAlt: 'Moxi - 你的可爱 Moxi 伙伴',
    },
    trustedBy: {
      kicker: '深受信赖',
      headingPrefix: '超过',
      million: '百万',
      headingSuffix: '个服务器',
      description: '为全球 Discord 社区用心打造',
    },
    welcomeMessages: {
      title: '欢迎消息',
      description1: 'Moxi 可自定义欢迎、告别与助力消息，提升服务器体验。',
      description2:
        '你可以使用多种变量自定义消息，打造独特而美观的内容。有了 Moxi，大家都会感到宾至如归。',
      link: '了解更多欢迎消息',
      mockup: {
        line1: '欢迎来到服务器！',
        line2Prefix: '希望你玩得开心，',
        line2Middle: '我们现在有',
        line2Suffix: '位成员。',
      },
    },
    roleplay: {
      title: '角色扮演',
      description1:
        '拥有 100+ 命令和 10,000 张包含拥抱、摸头、咬咬等的 GIF，Moxi 是拥有最多样化角色扮演命令的机器人。',
      description2:
        'Moxi 还有计数器，让你看到收到拥抱、亲亲、摸头等的次数。GIF 精心挑选，适合所有年龄段。',
      link: '了解更多角色扮演',
      mockup: {
        hugVerb: '给了一个拥抱给',
        gifLabel: '动漫拥抱 GIF',
        timesHugged: '被拥抱次数：',
      },
    },
    currency: {
      title: '经济',
      ranking: '全球排行榜',
      description1: 'Moxi 拥有完整的全球经济系统，鼓励成员互动。',
      description2: '等级、余额、宠物、俱乐部、婚姻等。Moxi 的经济系统非常完整且有趣。',
      description3:
        '每两个月会开启全球活动，有机会赢取独家物品。冲榜并登顶全球经济榜单。',
      link: '了解更多经济系统',
    },
    utilities: {
      title: '工具',
      description1: 'Moxi 可为你的服务器执行自动化与娱乐任务。',
      description2: '迫不及待想看下一集动画？Moxi 会在上线时提醒你。',
      description3: '自动发布老婆图、动画通知、服务器保护等。Moxi 无所不能。',
      link: '了解更多工具',
      mockup: {
        newEpisode: '新集已上线',
        episodeTitle: '第 8 集 - 找不到就别找',
        watchEpisode: '观看集数',
        protectionTitle: '服务器保护',
        protectionBody: '已启用反垃圾。你的服务器可防止未经授权的邀请链接。',
      },
    },
    featuresGrid: {
      title: '一体化机器人',
      subtitle: 'Moxi 全都能做',
      items: {
        anime: '动漫',
        roleplay: '角色扮演',
        starboard: '精华板',
        giveaways: '抽奖',
        birthdays: '生日',
        levels: '等级',
        currency: '经济',
        pets: '宠物',
        marriages: '婚姻',
        moderation: '管理',
        logs: '日志',
        fun: '娱乐',
        configuration: '配置',
        utilities: '工具',
        more: '还有更多...',
      },
    },
    modulesShowcase: {
      badge: '为社区而生的模块',
      title: '你的服务器，你的风格',
      description: '不再是无尽列表，而是清晰地图：Moxi 做什么，以及它为何与众不同。',
      modules: {
        welcome: {
          title: '欢迎与助力',
          description: '欢迎、告别与助力消息，支持变量与自定义样式。',
          chips: ['变量', '嵌入', '自动身份组'],
        },
        roleplay: {
          title: '角色扮演',
          description: '互动、GIF 与计数器，让社区更有乐趣。',
          chips: ['100+ 命令', '计数器', '全年龄'],
        },
        currency: {
          title: '经济',
          description: '简单经济与排行榜，鼓励活跃与奖励。',
          chips: ['排行榜', '奖励', '余额'],
        },
        utilities: {
          title: '工具',
          description: '自动化、提醒与工具，让服务器保持新鲜。',
          chips: ['通知', '自动任务', '助手'],
        },
        moderation: {
          title: '管理',
          description: '清晰的管理工具，保持安全与秩序。',
          chips: ['反袭击', '日志', '过滤器'],
        },
        vibes: {
          title: '专属氛围',
          description: '小细节让 Moxi 更像你的：语气、回复与风格。',
          chips: ['个性', '风格', '一致性'],
        },
      },
    },
    trustedServers: {
      badge: '信赖的服务器',
      title: '感谢信赖 Moxi',
      descriptionPrefix: '已有',
      descriptionSuffix: '个服务器每天使用我们的机器人',
      verified: '已验证',
      members: '成员',
    },
    ai: {
      title: '认识你的新朋友',
      subtitle: 'Moxi 现已加入人工智能',
      listTitle: '与其他机器人不同，Moxi：',
      features: {
        cute: {
          title: '可爱又友好',
          description: '每次互动都可爱亲切',
        },
        adaptive: {
          title: '智能且自适应',
          description: '适应每个服务器并从互动中学习',
        },
        companion: {
          title: '你的完美伙伴',
          description: '让你的服务器更有趣、更有条理',
        },
      },
      chat: {
        greeting: '嗨！我是 Moxi :3',
        help: '今天想要我帮你做什么？ ✨',
        imageGen: '生成图片',
        madeWith: '由 Moxi 制作',
      },
    },
    wiki: {
      title: '教程与指南',
      subtitle: '你需要的一切都在官方 Wiki',
      features: {
        docs: {
          title: '详尽文档',
          description: '600+ 命令详细说明',
        },
        search: {
          title: '易于查找',
          description: '使用搜索功能快速找到所需内容',
        },
        community: {
          title: '社区驱动',
          description: '志愿者团队定期更新',
        },
      },
      button: '前往 Wiki',
    },
    finalCta: {
      title: '要开始我们的故事吗？',
    },
    footer: {
      description: '一个鼓励服务器活跃度的机器人。',
      resources: '资源',
      moxi: 'Moxi',
      legal: '法律',
      copyright: '© Gwee & Kwee, 2026, 保留所有权利',
      links: {
        patreon: 'Patreon',
        wiki: 'Moxi Wiki',
        gallery: '画廊',
        supportServer: '支持服务器',
        suggestions: '建议',
        reports: '举报',
        partners: '合作伙伴',
        terms: '服务条款',
        privacy: '隐私政策',
        refund: '退款政策',
      },
    },
    commands: {
      title: '命令',
      subtitle: '查看 Moxi 的完整命令列表',
      searchPlaceholder: '搜索命令…',
      categories: '分类',
      filters: {
        filterTitle: '筛选',
        all: '全部',
        prefix: '命令',
        slash: '斜杠命令',
      },
      resultsSingle: '条结果',
      resultsPlural: '条结果',
      loading: '加载中…',
      errors: {
        load:
          '无法从 MongoDB 加载列表。请使用 `npm run dev:full` 或 `npm run start` 启动服务器，并检查 `.env.local` 中的 `MONGODB_URI`。',
      },
      labels: {
        usage: '用法：',
        aliases: '别名',
        examples: '示例',
        subcommands: '子命令',
        cooldown: '冷却：',
      },
      empty: '没有找到结果。',
      category: {
        all: '全部',
        other: '其他',
      },
    },
    commandPlayground: {
      kicker: 'Moxi 触感：真实命令',
      title: '5 秒试用一个命令',
      description: '这不是模拟：它由 Commands 页面相同的列表驱动。',
      placeholder: '输入：.auction help, /audit on, 8ball…',
      counts: '{total} 总计 · {prefix} 前缀 · {slash} 斜杠',
      loading: '正在加载命令…',
      previewLoading: '· 正在准备预览…',
      previewQueued: '· 预览排队中（{status}）',
      previewQueuedStatus: '排队中',
      errors: {
        load: 'MongoDB API 不可用。请运行 `npm run dev`（或 `npm run dev:api`）并刷新。',
        fallback: '无法从 MongoDB 加载',
      },
      noPreview: '此命令在 playground_jobs 中没有保存预览。',
      selectPlaceholder: '请选择…',
    },
    discord: {
      preview: 'Moxi 预览',
    },
    dashboard: {
      loading: '加载中…',
      signingIn: '登录中…',
      refresh: '刷新',
      logout: '退出登录',
      moxiActive: 'Moxi 已激活',
      serverSingular: '个服务器',
      serverPlural: '个服务器',
      canInvite: '可以邀请 Moxi',
      whereAdmin: '你是管理员的服务器',
      noServers: '你没有拥有管理员权限的服务器。',
      manage: '管理',
      invite: '邀请 Moxi',
      moxiHere: 'Moxi 在此服务器中',
    },
    server: {
      back: '我的面板',
      moxiActive: 'Moxi 在此服务器中活跃',
      notFound: '未找到服务器或你没有访问权限。',
      backToPanel: '返回面板',
      modulesTitle: '可用模块',
      modulesDesc: '此服务器已开放所有 Moxi 模块。各模块的独立配置功能即将推出。',
      viewDocs: '查看文档',
      modules: {
        welcome: { name: '欢迎', description: '用户加入或离开服务器时的自定义消息。' },
        roleplay: { name: '角色扮演', description: '含角色、动作和互动叙事的角色系统。' },
        economy: { name: '经济', description: '虚拟货币系统、商店、银行和每日奖励。' },
        utilities: { name: '工具', description: '通用工具：天气、翻译、用户信息等。' },
        moderation: { name: '管理', description: '封禁、禁言、警告、日志和可配置自动管理。' },
        ai: { name: 'AI 与聊天', description: '智能回复、对话和内容生成。' },
        music: { name: '音乐', description: '在语音频道播放 YouTube、Spotify 等平台的音乐。' },
        giveaways: { name: '抽奖', description: '创建和管理带有反应和自动获奖者的抽奖活动。' },
        tickets: { name: '工单', description: '每位用户专属私人频道的支持系统。' },
        logs: { name: '日志', description: '编辑、删除、加入/离开和管理操作记录。' },
        automod: { name: '自动管理', description: '词汇、垃圾信息、链接和大量提及的自动过滤器。' },
        wiki: { name: 'Wiki', description: '集成到服务器的知识库，支持自定义命令。' },
      },
    },
  },
  ja: {
    common: {
      addBot: 'ボットを追加',
      manageServers: 'サーバー管理',
      premium: 'プレミアム',
      login: 'ログイン',
      invite: '招待',
      support: 'サポート',
      viewAll: 'すべて見る',
    },
    header: {
      nav: {
        commands: 'コマンド',
        modules: 'モジュール',
        resources: 'リソース',
      },
      modules: {
        welcome: 'ウェルカム',
        roleplay: 'ロールプレイ',
        currency: '通貨',
        utilities: 'ユーティリティ',
        moderation: 'モデレーション',
      },
      resources: {
        documentation: 'ドキュメント',
        commands: 'コマンド',
        gallery: 'ギャラリー',
        support: 'サポート',
      },
      theme: {
        light: 'ライトモードに切り替え',
        dark: 'ダークモードに切り替え',
      },
    },
    hero: {
      badge: 'いちばん可愛いボット',
      title: 'Discord のかわいい相棒 Moxi',
      description:
        'オールインワンのアニメボットで活気あるコミュニティを作ろう。通貨、ロールプレイ、音楽、管理を一つに。シンプルで可愛く、つながりを作るために設計。',
      imageAlt: 'Moxi - かわいい Moxi の相棒',
    },
    trustedBy: {
      kicker: '信頼されています',
      headingPrefix: 'のべ',
      million: '百万',
      headingSuffix: 'サーバー以上',
      description: '世界中の Discord コミュニティのために作られました',
    },
    welcomeMessages: {
      title: 'ウェルカムメッセージ',
      description1:
        'Moxi はウェルカム、フェアウェル、ブーストのメッセージをカスタマイズできます。',
      description2:
        '複数の変数でメッセージをカスタマイズし、唯一無二で美しいメッセージを作成できます。Moxi がいれば、誰もが歓迎されます。',
      link: 'ウェルカムメッセージの詳細',
      mockup: {
        line1: 'サーバーへようこそ！',
        line2Prefix: '滞在を楽しんでね、',
        line2Middle: '現在',
        line2Suffix: '人のメンバーです。',
      },
    },
    roleplay: {
      title: 'ロールプレイ',
      description1:
        '100 以上のコマンドと 10,000 件の GIF（ハグ、なでなで、かみつきなど）を備え、Moxi は最も多彩なロールプレイコマンドを提供します。',
      description2:
        'ハグやキスなどの回数を確認できるカウンターもあります。GIF は全年齢向けに丁寧に選定されています。',
      link: 'ロールプレイの詳細',
      mockup: {
        hugVerb: 'がハグしました',
        gifLabel: 'アニメのハグ GIF',
        timesHugged: 'ハグ回数：',
      },
    },
    currency: {
      title: '通貨',
      ranking: 'グローバルランキング',
      description1: 'Moxi にはメンバーの交流を促す完全なグローバル通貨システムがあります。',
      description2: 'レベル、残高、ペット、クラブ、結婚など。Moxi の通貨はとても充実しています。',
      description3:
        '2 か月ごとにグローバルイベントが開催され、限定アイテムを獲得できます。ランキングを上げてトップを目指そう。',
      link: '通貨の詳細',
    },
    utilities: {
      title: 'ユーティリティ',
      description1: 'Moxi はサーバーの自動化やエンタメを提供します。',
      description2: '次のアニメの話が待ちきれない？Moxi が配信を通知します。',
      description3: '自動投稿、アニメ通知、サーバー保護など、Moxi が全部やります。',
      link: 'ユーティリティの詳細',
      mockup: {
        newEpisode: '新エピソード公開',
        episodeTitle: '第 8 話 - 何も探さなければ何も見つからない',
        watchEpisode: '視聴する',
        protectionTitle: 'サーバー保護',
        protectionBody: 'スパム対策が有効です。招待リンクの不正共有から保護します。',
      },
    },
    featuresGrid: {
      title: 'オールインワンのボット',
      subtitle: 'Moxi は何でもできる',
      items: {
        anime: 'アニメ',
        roleplay: 'ロールプレイ',
        starboard: 'スター掲示板',
        giveaways: 'ギブアウェイ',
        birthdays: '誕生日',
        levels: 'レベル',
        currency: '通貨',
        pets: 'ペット',
        marriages: '結婚',
        moderation: 'モデレーション',
        logs: 'ログ',
        fun: 'お楽しみ',
        configuration: '設定',
        utilities: 'ユーティリティ',
        more: 'その他…',
      },
    },
    modulesShowcase: {
      badge: 'コミュニティ向けモジュール',
      title: 'あなたのサーバー、あなたのスタイル',
      description: '長い一覧ではなく、Moxi の特徴が一目でわかるマップです。',
      modules: {
        welcome: {
          title: 'ウェルカム＆ブースト',
          description: 'ウェルカムやフェアウェル、ブーストメッセージをカスタム。',
          chips: ['変数', '埋め込み', '自動ロール'],
        },
        roleplay: {
          title: 'ロールプレイ',
          description: 'リアクション、GIF、カウンターで盛り上げます。',
          chips: ['100+ コマンド', 'カウンター', '全年齢'],
        },
        currency: {
          title: '通貨',
          description: 'シンプルな経済とランキングで活動を促進。',
          chips: ['ランキング', '報酬', '残高'],
        },
        utilities: {
          title: 'ユーティリティ',
          description: '自動化、通知、便利ツールで最新の状態に。',
          chips: ['通知', '自動タスク', 'ヘルパー'],
        },
        moderation: {
          title: 'モデレーション',
          description: '安全で整理されたサーバーのための明確なツール。',
          chips: ['アンチレイド', 'ログ', 'フィルター'],
        },
        vibes: {
          title: 'カスタム雰囲気',
          description: '口調や返信、スタイルで "自分の" Moxi に。',
          chips: ['個性', 'スタイル', '一貫性'],
        },
      },
    },
    trustedServers: {
      badge: '信頼されるサーバー',
      title: 'Moxi を信頼してくれてありがとう',
      descriptionPrefix: '毎日',
      descriptionSuffix: 'のサーバーが利用しています',
      verified: '認証済み',
      members: 'メンバー',
    },
    ai: {
      title: '新しい友達に会おう',
      subtitle: 'Moxi は AI 搭載になりました',
      listTitle: '他のボットとは違う Moxi：',
      features: {
        cute: {
          title: 'かわいくてフレンドリー',
          description: 'どのやり取りも可愛く親しみやすい',
        },
        adaptive: {
          title: '賢くて適応的',
          description: 'サーバーに合わせて学習します',
        },
        companion: {
          title: '完璧な相棒',
          description: 'サーバーをもっと楽しく整理された場所にします',
        },
      },
      chat: {
        greeting: 'やあ！Moxi だよ :3',
        help: '今日は何を手伝おうか？ ✨',
        imageGen: '画像生成',
        madeWith: 'Moxi で作成',
      },
    },
    wiki: {
      title: 'チュートリアルとガイド',
      subtitle: '必要な情報は公式 Wiki にすべて揃っています',
      features: {
        docs: {
          title: '充実したドキュメント',
          description: '600 以上のコマンドを詳細に解説',
        },
        search: {
          title: '簡単に探せる',
          description: '検索機能で素早く見つかります',
        },
        community: {
          title: 'コミュニティ主導',
          description: 'ボランティアチームによる定期更新',
        },
      },
      button: 'Wiki へ',
    },
    finalCta: {
      title: '物語を始めようか？',
    },
    footer: {
      description: 'サーバーの活動を促進するボット。',
      resources: 'リソース',
      moxi: 'Moxi',
      legal: '法的情報',
      copyright: '© Gwee & Kwee, 2026, All rights reserved',
      links: {
        patreon: 'Patreon',
        wiki: 'Moxi Wiki',
        gallery: 'ギャラリー',
        supportServer: 'サポートサーバー',
        suggestions: '提案',
        reports: '報告',
        partners: 'パートナー',
        terms: '利用規約',
        privacy: 'プライバシーポリシー',
        refund: '返金ポリシー',
      },
    },
    commands: {
      title: 'コマンド',
      subtitle: 'Moxi の豊富なコマンド一覧を確認',
      searchPlaceholder: 'コマンドを検索…',
      categories: 'カテゴリ',
      filters: {
        filterTitle: 'フィルター',
        all: 'すべて',
        prefix: 'コマンド',
        slash: 'スラッシュコマンド',
      },
      resultsSingle: '件',
      resultsPlural: '件',
      loading: '読み込み中…',
      errors: {
        load:
          'MongoDB から一覧を読み込めません。`npm run dev:full` または `npm run start` でサーバーを起動し、`.env.local` の `MONGODB_URI` を確認してください。',
      },
      labels: {
        usage: '使い方：',
        aliases: '別名',
        examples: '例',
        subcommands: 'サブコマンド',
        cooldown: 'クールダウン：',
      },
      empty: '検索結果がありません。',
      category: {
        all: 'すべて',
        other: 'その他',
      },
    },
    commandPlayground: {
      kicker: 'Moxi のタッチ：実際のコマンド',
      title: '5 秒でコマンドを試す',
      description: 'これはモックではありません。Commands ページと同じ一覧を使用しています。',
      placeholder: '入力：.auction help, /audit on, 8ball…',
      counts: '合計 {total} · プレフィックス {prefix} · スラッシュ {slash}',
      loading: 'コマンド読み込み中…',
      previewLoading: '· プレビュー準備中…',
      previewQueued: '· プレビュー待機中（{status}）',
      previewQueuedStatus: '待機中',
      errors: {
        load: 'MongoDB API が利用できません。`npm run dev`（または `npm run dev:api`）を実行して更新してください。',
        fallback: 'MongoDB から読み込めません',
      },
      noPreview: 'このコマンドの preview が playground_jobs に保存されていません。',
      selectPlaceholder: '選択…',
    },
    discord: {
      preview: 'Moxi プレビュー',
    },
    dashboard: {
      loading: '読み込み中…',
      signingIn: 'ログイン中…',
      refresh: '更新',
      logout: 'ログアウト',
      moxiActive: 'Moxi 稼働中',
      serverSingular: 'サーバー',
      serverPlural: 'サーバー',
      canInvite: 'Moxi を招待できます',
      whereAdmin: '管理者のサーバー',
      noServers: '管理者権限を持つサーバーはありません。',
      manage: '管理する',
      invite: 'Moxi を招待',
      moxiHere: 'このサーバーに Moxi がいます',
    },
    server: {
      back: 'マイパネル',
      moxiActive: 'Moxi がこのサーバーで稼働中',
      notFound: 'サーバーが見つからないか、アクセス権がありません。',
      backToPanel: 'パネルに戻る',
      modulesTitle: '利用可能なモジュール',
      modulesDesc: 'このサーバーですべての Moxi モジュールをご利用いただけます。モジュールごとの個別設定は近日公開予定です。',
      viewDocs: 'ドキュメントを見る',
      modules: {
        welcome: { name: 'ウェルカム', description: 'ユーザーがサーバーに参加または退出したときのカスタムメッセージ。' },
        roleplay: { name: 'ロールプレイ', description: 'キャラクター、アクション、インタラクティブなナラティブを持つロールシステム。' },
        economy: { name: '通貨', description: '仮想通貨システム、ショップ、バンク、デイリー報酬。' },
        utilities: { name: 'ユーティリティ', description: '天気、翻訳、ユーザー情報などの一般ツール。' },
        moderation: { name: 'モデレーション', description: 'BAN、ミュート、警告、ログ、設定可能なオートモデレーション。' },
        ai: { name: 'AI & チャット', description: 'スマートな返信、会話、コンテンツ生成。' },
        music: { name: '音楽', description: 'ボイスチャンネルで YouTube、Spotify などの音楽を再生。' },
        giveaways: { name: 'ギブアウェイ', description: 'リアクションと自動当選者でギブアウェイを作成・管理。' },
        tickets: { name: 'チケット', description: 'ユーザーごとのプライベートチャンネルによるサポートシステム。' },
        logs: { name: 'ログ', description: '編集・削除・参加/退出・モデレーターアクションの記録。' },
        automod: { name: 'オートモデレーション', description: '単語、スパム、リンク、大量メンションの自動フィルター。' },
        wiki: { name: 'Wiki', description: 'カスタムコマンドでサーバーに統合されたナレッジベース。' },
      },
    },
  },
  ko: {
    common: {
      addBot: '봇 추가',
      manageServers: '서버 관리',
      premium: '프리미엄',
      login: '로그인',
      invite: '초대',
      support: '지원',
      viewAll: '전체 보기',
    },
    header: {
      nav: {
        commands: '명령어',
        modules: '모듈',
        resources: '리소스',
      },
      modules: {
        welcome: '환영',
        roleplay: '롤플레잉',
        currency: '경제',
        utilities: '유틸리티',
        moderation: '관리',
      },
      resources: {
        documentation: '문서',
        commands: '명령어',
        gallery: '갤러리',
        support: '지원',
      },
      theme: {
        light: '라이트 모드로 전환',
        dark: '다크 모드로 전환',
      },
    },
    hero: {
      badge: '가장 귀여운 봇',
      title: 'Discord에서 만나는 귀여운 Moxi 친구',
      description:
        '올인원 애니메이션 봇으로 활기찬 커뮤니티를 만드세요. 경제, 롤플레잉, 음악, 관리가 한 곳에. 간단하고 사랑스럽고, 소통을 위해 설계되었습니다.',
      imageAlt: 'Moxi - 귀여운 Moxi 친구',
    },
    trustedBy: {
      kicker: '함께하는 서버',
      headingPrefix: '총',
      million: '백만',
      headingSuffix: '개의 서버',
      description: '전 세계 Discord 커뮤니티를 위해 사랑으로 제작',
    },
    welcomeMessages: {
      title: '환영 메시지',
      description1: 'Moxi는 환영, 작별, 부스트 메시지를 맞춤 설정할 수 있습니다.',
      description2:
        '여러 변수를 활용해 독특하고 아름다운 메시지를 만들 수 있어요. Moxi가 있으면 모두가 환영받는 느낌을 받을 거예요!',
      link: '환영 메시지 더 알아보기',
      mockup: {
        line1: '서버에 오신 것을 환영합니다!',
        line2Prefix: '즐거운 시간 되길 바라요,',
        line2Middle: '현재',
        line2Suffix: '명입니다.',
      },
    },
    roleplay: {
      title: '롤플레잉',
      description1:
        '100개 이상의 명령어와 10,000개의 포옹, 쓰다듬기, 물기 GIF를 제공하며, Moxi는 가장 다양한 롤플레잉 명령어를 가진 봇입니다.',
      description2:
        '포옹, 키스, 쓰다듬기 등의 횟수를 확인할 수 있는 카운터가 있습니다. GIF는 모든 연령대에 맞게 엄선되었습니다.',
      link: '롤플레잉 더 알아보기',
      mockup: {
        hugVerb: '에게 포옹을 해요',
        gifLabel: '애니 포옹 GIF',
        timesHugged: '포옹 횟수:',
      },
    },
    currency: {
      title: '경제',
      ranking: '글로벌 랭킹',
      description1: 'Moxi는 서버 구성원 간의 상호작용을 장려하는 완전한 글로벌 경제 시스템을 갖추고 있습니다.',
      description2: '레벨, 잔액, 펫, 클럽, 결혼 등. Moxi의 경제는 매우 풍부하고 재미있습니다.',
      description3:
        '두 달마다 글로벌 이벤트가 열려 특별 아이템을 획득할 기회가 있습니다. 랭킹에 올라 글로벌 경제의 정상에 도전하세요.',
      link: '경제 더 알아보기',
    },
    utilities: {
      title: '유틸리티',
      description1: 'Moxi는 서버를 위한 자동화 및 엔터테인먼트 작업을 수행합니다.',
      description2: '좋아하는 애니의 다음 화가 기다려지나요? Moxi가 나왔을 때 알려줍니다.',
      description3: '와이푸 자동 게시, 애니 알림, 서버 보호 등 Moxi가 모두 해줍니다.',
      link: '유틸리티 더 알아보기',
      mockup: {
        newEpisode: '새 에피소드 공개',
        episodeTitle: '에피소드 8 - 찾지 않으면 찾을 수 없다',
        watchEpisode: '에피소드 보기',
        protectionTitle: '서버 보호',
        protectionBody: '스팸 방지 활성화. 무단 초대 링크로부터 서버를 보호합니다.',
      },
    },
    featuresGrid: {
      title: '올인원 봇',
      subtitle: 'Moxi가 모든 것을 해줘요',
      items: {
        anime: '애니메이션',
        roleplay: '롤플레잉',
        starboard: '스타보드',
        giveaways: '이벤트',
        birthdays: '생일',
        levels: '레벨',
        currency: '경제',
        pets: '펫',
        marriages: '결혼',
        moderation: '관리',
        logs: '로그',
        fun: '즐거움',
        configuration: '설정',
        utilities: '유틸리티',
        more: '그리고 더 많은…',
      },
    },
    modulesShowcase: {
      badge: '커뮤니티를 위한 모듈',
      title: '당신의 서버, 당신의 스타일',
      description: '끝없는 목록 대신, Moxi가 무엇을 하는지 명확한 지도로 보여줍니다.',
      modules: {
        welcome: {
          title: '환영 및 부스트',
          description: '변수와 맞춤 스타일로 환영, 작별, 부스트 메시지를 제공합니다.',
          chips: ['변수', '임베드', '자동 역할'],
        },
        roleplay: {
          title: '롤플레잉',
          description: '리액션, GIF, 카운터로 커뮤니티를 즐겁게 합니다.',
          chips: ['100+ 명령어', '카운터', '전 연령'],
        },
        currency: {
          title: '경제',
          description: '간단한 경제와 랭킹으로 활동과 보상을 유도합니다.',
          chips: ['랭킹', '보상', '잔액'],
        },
        utilities: {
          title: '유틸리티',
          description: '자동화, 알림, 도구로 서버를 최신 상태로 유지합니다.',
          chips: ['알림', '자동 작업', '헬퍼'],
        },
        moderation: {
          title: '관리',
          description: '서버를 안전하고 정돈되게 유지하는 명확한 도구.',
          chips: ['안티 레이드', '로그', '필터'],
        },
        vibes: {
          title: '커스텀 분위기',
          description: '말투, 응답, 스타일로 "나만의" Moxi를 만들 수 있어요.',
          chips: ['개성', '스타일', '일관성'],
        },
      },
    },
    trustedServers: {
      badge: '신뢰받는 서버',
      title: 'Moxi를 믿어줘서 고마워요',
      descriptionPrefix: '매일',
      descriptionSuffix: '개의 서버가 우리 봇을 사용합니다',
      verified: '검증됨',
      members: '명',
    },
    ai: {
      title: '새 친구를 만나보세요',
      subtitle: 'Moxi, 이제 인공지능까지',
      listTitle: '다른 봇과 달리 Moxi는:',
      features: {
        cute: {
          title: '귀엽고 친근함',
          description: '매 순간 사랑스럽고 다가가기 쉽도록 설계',
        },
        adaptive: {
          title: '적응적이고 똑똑함',
          description: '각 서버에 맞춰 적응하고 상호작용에서 배움',
        },
        companion: {
          title: '완벽한 동반자',
          description: '서버를 더 재미있고 정돈되게 만들어줍니다',
        },
      },
      chat: {
        greeting: '안녕! 나는 Moxi :3',
        help: '오늘 무엇을 도와줄까? ✨',
        imageGen: '이미지 생성',
        madeWith: 'Moxi로 제작',
      },
    },
    wiki: {
      title: '튜토리얼과 가이드',
      subtitle: '필요한 모든 정보는 공식 Wiki에 있습니다',
      features: {
        docs: {
          title: '방대한 문서',
          description: '600개 이상의 명령어를 자세히 설명',
        },
        search: {
          title: '쉽게 탐색',
          description: '검색 기능으로 빠르게 찾아보세요',
        },
        community: {
          title: '커뮤니티 중심',
          description: '자원봉사 팀의 정기 업데이트',
        },
      },
      button: 'Wiki로 이동',
    },
    finalCta: {
      title: '우리의 이야기를 시작할까요?',
    },
    footer: {
      description: '서버의 활동을 촉진하는 봇.',
      resources: '리소스',
      moxi: 'Moxi',
      legal: '법률',
      copyright: '© Gwee & Kwee, 2026, All rights reserved',
      links: {
        patreon: 'Patreon',
        wiki: 'Moxi Wiki',
        gallery: '갤러리',
        supportServer: '지원 서버',
        suggestions: '제안',
        reports: '신고',
        partners: '파트너',
        terms: '서비스 약관',
        privacy: '개인정보 처리방침',
        refund: '환불 정책',
      },
    },
    commands: {
      title: '명령어',
      subtitle: 'Moxi의 방대한 명령어 목록을 확인하세요',
      searchPlaceholder: '명령어 검색…',
      categories: '카테고리',
      filters: {
        filterTitle: '필터',
        all: '전체',
        prefix: '명령어',
        slash: '슬래시 명령어',
      },
      resultsSingle: '개 결과',
      resultsPlural: '개 결과',
      loading: '로딩 중…',
      errors: {
        load:
          'MongoDB에서 목록을 불러올 수 없습니다. `npm run dev:full` 또는 `npm run start`로 서버를 실행하고 `.env.local`의 `MONGODB_URI`를 확인하세요.',
      },
      labels: {
        usage: '사용법:',
        aliases: '별칭',
        examples: '예시',
        subcommands: '하위 명령어',
        cooldown: '쿨다운:',
      },
      empty: '검색 결과가 없습니다.',
      category: {
        all: '전체',
        other: '기타',
      },
    },
    commandPlayground: {
      kicker: 'Moxi 감성: 실제 명령어',
      title: '5초 만에 명령어 테스트',
      description: '이건 모형이 아니에요. Commands 페이지와 동일한 목록을 사용합니다.',
      placeholder: '입력: .auction help, /audit on, 8ball…',
      counts: '총 {total} · 프리픽스 {prefix} · 슬래시 {slash}',
      loading: '명령어 불러오는 중…',
      previewLoading: '· 미리보기 준비 중…',
      previewQueued: '· 미리보기 대기 중 ({status})',
      previewQueuedStatus: '대기 중',
      errors: {
        load: 'MongoDB API를 사용할 수 없습니다. `npm run dev`(또는 `npm run dev:api`) 실행 후 새로고침하세요.',
        fallback: 'MongoDB에서 불러올 수 없습니다',
      },
      noPreview: '이 명령어에 대한 preview가 playground_jobs에 저장되어 있지 않습니다.',
      selectPlaceholder: '선택…',
    },
    discord: {
      preview: 'Moxi 미리보기',
    },
    dashboard: {
      loading: '로딩 중…',
      signingIn: '로그인 중…',
      refresh: '새로고침',
      logout: '로그아웃',
      moxiActive: 'Moxi 활성화',
      serverSingular: '개 서버',
      serverPlural: '개 서버',
      canInvite: 'Moxi 초대 가능',
      whereAdmin: '관리자인 서버',
      noServers: '관리자 권한이 있는 서버가 없습니다.',
      manage: '관리',
      invite: 'Moxi 초대',
      moxiHere: '이 서버에 Moxi가 있어요',
    },
    server: {
      back: '내 패널',
      moxiActive: 'Moxi가 이 서버에서 활성화됨',
      notFound: '서버를 찾을 수 없거나 접근 권한이 없습니다.',
      backToPanel: '패널로 돌아가기',
      modulesTitle: '사용 가능한 모듈',
      modulesDesc: '이 서버에서 모든 Moxi 모듈을 사용할 수 있습니다. 모듈별 개별 설정은 곧 제공될 예정입니다.',
      viewDocs: '문서 보기',
      modules: {
        welcome: { name: '환영', description: '사용자가 서버에 참여하거나 떠날 때의 맞춤 메시지.' },
        roleplay: { name: '롤플레잉', description: '캐릭터, 액션, 상호작용 내러티브가 있는 롤 시스템.' },
        economy: { name: '경제', description: '가상 화폐 시스템, 상점, 은행, 일일 보상.' },
        utilities: { name: '유틸리티', description: '날씨, 번역, 사용자 정보 등의 일반 도구.' },
        moderation: { name: '관리', description: '차단, 음소거, 경고, 로그, 설정 가능한 자동 관리.' },
        ai: { name: 'AI & 채팅', description: '스마트 답변, 대화 및 콘텐츠 생성.' },
        music: { name: '음악', description: '음성 채널에서 YouTube, Spotify 등의 음악 재생.' },
        giveaways: { name: '이벤트', description: '반응과 자동 당첨자가 있는 이벤트 생성 및 관리.' },
        tickets: { name: '티켓', description: '사용자별 전용 채널을 통한 지원 시스템.' },
        logs: { name: '로그', description: '편집, 삭제, 참여/퇴장 및 관리자 작업 기록.' },
        automod: { name: '자동 관리', description: '단어, 스팸, 링크, 대량 멘션 자동 필터.' },
        wiki: { name: '위키', description: '맞춤 명령어로 서버에 통합된 지식 베이스.' },
      },
    },
  },
} as const;

type Translations = typeof translations;
type Language = keyof Translations;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedValue(source: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, source);
}

function formatTemplate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && stored in translations) return stored;
  return DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getInitialLanguage());

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getNestedValue(translations[language], key);
      if (typeof value !== 'string') return key;
      return formatTemplate(value, vars);
    },
    [language]
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export type { Language };
