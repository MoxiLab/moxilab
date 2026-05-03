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
          title: 'Bienvenida',
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
        economy: {
          title: 'Economia',
          description:
            'Economia completa con tienda, trabajo, mineria, rankings y recompensas.',
          chips: ['Rankings', 'Tienda', 'Recompensas'],
        },
        utilities: {
          title: 'Utilidades',
          description:
            'Automatizaciones, avisos y herramientas para llevar el server al dia.',
          chips: ['Notificaciones', 'AFK', 'Info'],
        },
        moderation: {
          title: 'Moderacion',
          description:
            'Herramientas claras para mantener tu servidor seguro y ordenado.',
          chips: ['Anti-raid', 'Logs', 'Filtros'],
        },
        ai: {
          title: 'Inteligencia Artificial',
          description:
            'Moxi con IA: respuestas inteligentes, generacion de imagenes y mas.',
          chips: ['Chat IA', 'Imagenes', 'Adaptativa'],
        },
        music: {
          title: 'Musica',
          description:
            'Reproduce musica de alta calidad en canales de voz con cola y controles.',
          chips: ['Cola', 'Calidad', 'Controles'],
        },
        giveaways: {
          title: 'Sorteos',
          description:
            'Organiza sorteos facilmente con ganadores automaticos y multiples opciones.',
          chips: ['Auto ganador', 'Requisitos', 'Personalizable'],
        },
        tickets: {
          title: 'Tickets',
          description:
            'Sistema de soporte por tickets para atender a los miembros de tu servidor.',
          chips: ['Soporte', 'Categorias', 'Logs'],
        },
        logs: {
          title: 'Registros',
          description:
            'Registra todos los eventos del servidor: mensajes, entradas, salidas y mas.',
          chips: ['Eventos', 'Mensajes', 'Miembros'],
        },
        automod: {
          title: 'Automoderación',
          description:
            'Filtra contenido automaticamente y protege tu servidor sin intervención manual.',
          chips: ['Filtros', 'Anti-spam', 'Anti-insultos'],
        },
        wiki: {
          title: 'Wiki',
          description:
            'Base de conocimiento integrada para que tu comunidad encuentre respuestas rapido.',
          chips: ['Busqueda', 'Articulos', 'Facil de usar'],
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
        economy:      { name: 'Economía',     description: 'Gestiona una economía virtual completa con monedas, tienda, banco, apuestas y recompensas diarias. Los usuarios pueden ganar, gastar e invertir en tu servidor.' },
        fun:          { name: 'Diversión',     description: 'Anima tu servidor con minijuegos, trivias, ruleta y comandos de entretenimiento variados. Perfecto para mantener a la comunidad activa y divertida.' },
        games:        { name: 'Juegos',        description: 'Juegos interactivos multijugador y actividades grupales para el servidor. Compite con otros miembros y sube en el ranking.' },
        genshin:      { name: 'Genshin',       description: 'Comandos, utilidades y contenido exclusivo relacionado con Genshin Impact. Consulta personajes, armas, eventos y mucho más.' },
        giveaways:    { name: 'Sorteos',       description: 'Crea y gestiona sorteos personalizados con duración, requisitos de participación, reacciones y selección automática de ganadores.' },
        matrimonio:   { name: 'Matrimonio',    description: 'Sistema de matrimonio y relaciones entre usuarios. Propón matrimonio, cásate, divórciarte y muestra tu pareja en el servidor.' },
        moderation:   { name: 'Moderación',   description: 'Herramientas completas de moderación: baneos, kicks, muteos temporales, advertencias, historial de infracciones y gestión de roles.' },
        music:        { name: 'Música',        description: 'Reproduce música de alta calidad desde YouTube, Spotify, SoundCloud y más. Colas, playlists, filtros de audio y panel interactivo.' },
        security:     { name: 'Seguridad',     description: 'Protege tu servidor con detección anti-raid, sistema de captcha para nuevos miembros, filtros de enlaces y protección contra spam masivo.' },
        sistemas:     { name: 'Sistemas',      description: 'Configuración interna avanzada del bot: ajustes por servidor, prefijos personalizados, idioma y comportamientos generales del sistema.' },
        social:       { name: 'Social',        description: 'Comandos de interacción social con GIFs animados: abrazos, palmadas, besos, saludos y más de 100 acciones para conectar con tu comunidad.' },
        streaming:    { name: 'Streaming',     description: 'Notificaciones automáticas cuando tus streamers favoritos se conectan en Twitch o YouTube. Configura alertas por canal y rol.' },
        systems:      { name: 'Systems',       description: 'Herramientas avanzadas de administración: autoroles, gestión de canales, mensajes de bienvenida/despedida y configuración general del servidor.' },
        tickets:      { name: 'Tickets',       description: 'Sistema de soporte profesional con canales privados por usuario, categorías, transcripciones, roles de soporte y panel de control integrado.' },
        tools:        { name: 'Herramientas',  description: 'Colección de utilidades prácticas: información de usuarios y servidores, calcula tiempo, busca en internet, traducciones y mucho más.' },
        utiility:     { name: 'Utilidades',    description: 'Comandos de utilidad complementarios para el servidor: recordatorios, encuestas, embeds personalizados y otras funciones de apoyo.' },
        verification: { name: 'Verificación', description: 'Sistema de verificación de nuevos miembros con captcha, preguntas o reacciones. Asigna roles automáticamente al verificarse.' },
        voice:        { name: 'Voz',           description: 'Gestiona canales de voz dinámicos, crea salas temporales, ajusta límites de usuarios y contról quien puede entrar a tu canal.' },
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
          title: 'Welcome',
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
        economy: {
          title: 'Economy',
          description:
            'Full economy with shop, work, mining, rankings and rewards.',
          chips: ['Rankings', 'Shop', 'Rewards'],
        },
        utilities: {
          title: 'Utilities',
          description:
            'Automations, alerts and tools to keep the server up to date.',
          chips: ['Notifications', 'AFK', 'Info'],
        },
        moderation: {
          title: 'Moderation',
          description:
            'Clear tools to keep your server safe and organized.',
          chips: ['Anti-raid', 'Logs', 'Filters'],
        },
        ai: {
          title: 'Artificial Intelligence',
          description:
            'Moxi with AI: smart replies, image generation and more.',
          chips: ['AI Chat', 'Images', 'Adaptive'],
        },
        music: {
          title: 'Music',
          description:
            'Play high-quality music in voice channels with queue and controls.',
          chips: ['Queue', 'Quality', 'Controls'],
        },
        giveaways: {
          title: 'Giveaways',
          description:
            'Easily organize giveaways with automatic winners and multiple options.',
          chips: ['Auto winner', 'Requirements', 'Customizable'],
        },
        tickets: {
          title: 'Tickets',
          description:
            'Support ticket system to assist members of your server.',
          chips: ['Support', 'Categories', 'Logs'],
        },
        logs: {
          title: 'Logs',
          description:
            'Record all server events: messages, joins, leaves and more.',
          chips: ['Events', 'Messages', 'Members'],
        },
        automod: {
          title: 'AutoMod',
          description:
            'Automatically filter content and protect your server without manual intervention.',
          chips: ['Filters', 'Anti-spam', 'Anti-slurs'],
        },
        wiki: {
          title: 'Wiki',
          description:
            'Integrated knowledge base so your community finds answers fast.',
          chips: ['Search', 'Articles', 'Easy to use'],
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
        economy:      { name: 'Economy',      description: 'Manage a full virtual economy with coins, shop, bank, bets and daily rewards. Users can earn, spend and invest within your server.' },
        fun:          { name: 'Fun',           description: 'Liven up your server with mini-games, trivia, roulette and varied entertainment commands. Perfect for keeping the community active and engaged.' },
        games:        { name: 'Games',         description: 'Interactive multiplayer games and group activities for the server. Compete with other members and climb the leaderboard.' },
        genshin:      { name: 'Genshin',       description: 'Commands, utilities and exclusive content related to Genshin Impact. Look up characters, weapons, events and much more.' },
        giveaways:    { name: 'Giveaways',     description: 'Create and manage custom giveaways with duration, entry requirements, reactions and automatic winner selection.' },
        matrimonio:   { name: 'Marriage',      description: 'Marriage and relationship system between users. Propose, marry, divorce and display your partner across the server.' },
        moderation:   { name: 'Moderation',    description: 'Full moderation toolkit: bans, kicks, temporary mutes, warnings, infraction history and role management.' },
        music:        { name: 'Music',         description: 'Play high-quality music from YouTube, Spotify, SoundCloud and more. Queues, playlists, audio filters and an interactive panel.' },
        security:     { name: 'Security',      description: 'Protect your server with anti-raid detection, captcha for new members, link filters and mass spam protection.' },
        sistemas:     { name: 'Sistemas',      description: 'Advanced internal bot configuration: per-server settings, custom prefixes, language and general system behavior.' },
        social:       { name: 'Social',        description: 'Social interaction commands with animated GIFs: hugs, pats, kisses, greetings and over 100 actions to connect with your community.' },
        streaming:    { name: 'Streaming',     description: 'Automatic notifications when your favorite streamers go live on Twitch or YouTube. Configure alerts per channel and role.' },
        systems:      { name: 'Systems',       description: 'Advanced administration tools: auto-roles, channel management, welcome/farewell messages and general server configuration.' },
        tickets:      { name: 'Tickets',       description: 'Professional support system with private channels per user, categories, transcripts, support roles and a built-in control panel.' },
        tools:        { name: 'Tools',         description: 'Collection of practical utilities: user and server info, time calculations, web search, translations and much more.' },
        utiility:     { name: 'Utility',       description: 'Complementary utility commands for the server: reminders, polls, custom embeds and other support functions.' },
        verification: { name: 'Verification',  description: 'New member verification system with captcha, questions or reactions. Automatically assigns roles upon successful verification.' },
        voice:        { name: 'Voice',         description: 'Manage dynamic voice channels, create temporary rooms, set user limits and control who can join your channel.' },
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
          title: '欢迎系统',
          description: '欢迎、告别与助力消息，支持变量与自定义样式。',
          chips: ['变量', '嵌入', '自动身份组'],
        },
        economy: {
          title: '经济',
          description: '90+ 经济命令：余额、商店、工作、挖矿与排行榜。',
          chips: ['排行榜', '商店', '奖励'],
        },
        utilities: {
          title: '工具',
          description: '自动化、提醒与工具，轻松让服务器保持新鲜。',
          chips: ['通知', 'AFK', '信息'],
        },
        moderation: {
          title: '管理',
          description: '清晰的管理工具，保持安全与秩序。',
          chips: ['反袭击', '日志', '过滤器'],
        },
        administration: {
          title: '服务器管理',
          description: '轻松管理身份组、表情、频道和权限。',
          chips: ['身份组', '表情', '频道'],
        },
        music: {
          title: '音乐',
          description: '在语音频道中播放高质量音乐，支持队列和控制。',
          chips: ['队列', '高质量', '控制'],
        },
        fun: {
          title: '娱乐与游戏',
          description: '小游戏、知识问答、8球等命令，让社区更热闹。',
          chips: ['小游戏', '问答', '8球'],
        },
        roleplay: {
          title: '角色扮演',
          description: '互动、GIF 与计数器，让社区更有乐趣。',
          chips: ['100+ 命令', '计数器', '全年龄'],
        },
        voice: {
          title: '语音频道',
          description: '为社区创建和管理临时、自定义语音频道。',
          chips: ['临时', '自定义', '自动'],
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
        economy:      { name: '经济',    description: '管理完整的虚拟经济：货币、商店、银行、赌博和每日奖励。用户可在服务器内赚取、消费和投资。' },
        fun:          { name: '娱乐',    description: '小游戏、问答、轮盘和多种娱乐命令，让社区保持活跃和活力。' },
        games:        { name: '游戏',    description: '服务器互动多人游戏和团体活动，与其他成员竞争并上排行榜。' },
        genshin:      { name: '原神',    description: '与原神相关的命令、工具和独家内容。查询角色、武器、活动等更多。' },
        giveaways:    { name: '抽奖',    description: '创建自定义抽奖，设置时长、参与要求、反应和自动开奖，让社区活动更加活跃。' },
        matrimonio:   { name: '婚姻',    description: '用户间的婚姻和关系系统。求婚、结婚、离婚，并在服务器展示您的伴侣。' },
        moderation:   { name: '管理',    description: '完整的管理工具：封禁、踢出、临时禁言、警告、违规历史和身份组管理。' },
        music:        { name: '音乐',    description: '从 YouTube、Spotify、SoundCloud 等平台播放高质量音乐。队列、播放列表、音效和互动面板。' },
        security:     { name: '安全',    description: '保护服务器：防raid检测、新成员验证码、链接过滤和防大量垃圾信息。' },
        sistemas:     { name: 'Sistemas',  description: '机器人高级内部配置：服务器设置、自定义前缀、语言和系统行为。' },
        social:       { name: '社交',    description: '带动图的社交互动命令：拥抱、拍头、亲吻、问候等超过100种动作。' },
        streaming:    { name: '直播',    description: '主播在 Twitch 或 YouTube 直播时自动推送通知，支持按频道和身份组配置。' },
        systems:      { name: '系统',    description: '高级管理工具：自动身份组、频道管理、欢迎/送别消息和服务器配置。' },
        tickets:      { name: '工单',    description: '专业客服系统：每位用户专属私人频道、分类、聊天记录、客服身份组和控制面板。' },
        tools:        { name: '工具',    description: '实用工具集合：用户和服务器信息、时间计算、网络搜索、翻译等更多功能。' },
        utiility:     { name: '实用',    description: '服务器补充实用命令：提醒、投票、自定义嵌入和其他辅助功能。' },
        verification: { name: '验证',    description: '新成员验证系统：验证码、问题或反应。验证成功后自动分配身份组。' },
        voice:        { name: '语音',    description: '管理动态语音频道、创建临时房间、设置人数限制和控制入屏权限。' },
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
          title: 'ウェルカムシステム',
          description: 'ウェルカムやフェアウェル、ブーストメッセージをカスタム。',
          chips: ['変数', '埋め込み', '自動ロール'],
        },
        economy: {
          title: '経済',
          description: '90以上の経済コマンド：残高、ショップ、仕事、マイニング、ランキング。',
          chips: ['ランキング', 'ショップ', '報酬'],
        },
        utilities: {
          title: 'ユーティリティ',
          description: '自動化、通知、便利ツールで最新の状態に保ちます。',
          chips: ['通知', 'AFK', '情報'],
        },
        moderation: {
          title: 'モデレーション',
          description: '安全で整理されたサーバーのための明確なツール。',
          chips: ['アンチレイド', 'ログ', 'フィルター'],
        },
        administration: {
          title: 'サーバー管理',
          description: 'ロール、絵文字、チャンネル、権限を簡単に管理。',
          chips: ['ロール', '絵文字', 'チャンネル'],
        },
        music: {
          title: 'ミュージック',
          description: 'ボイスチャンネルでキューとコントロール付きの高品質音楽を再生。',
          chips: ['キュー', '高品質', 'コントロール'],
        },
        fun: {
          title: '楽しみ＆ゲーム',
          description: 'ミニゲーム、トリビア、8ボールなどのコマンドでコミュニティを盛り上げ。',
          chips: ['ミニゲーム', 'トリビア', '8ボール'],
        },
        roleplay: {
          title: 'ロールプレイ',
          description: 'リアクション、GIF、カウンターで盛り上げます。',
          chips: ['100+ コマンド', 'カウンター', '全年齢'],
        },
        voice: {
          title: 'ボイスチャンネル',
          description: 'コミュニティ向けの一時的・カスタムボイスチャンネルを作成・管理。',
          chips: ['一時的', 'カスタム', '自動'],
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
        economy:      { name: '経済',           description: 'コイン、ショップ、バンク、賭け、デイリー報酬を幅広く管理。ユーザーはサーバー内で稼ぎ、消費、投資できます。' },
        fun:          { name: 'ファン',           description: 'ミニゲーム、クイズ、ルーレットや幅広いエンタメコマンドでコミュニティを盛り上げます。' },
        games:        { name: 'ゲーム',           description: 'サーバー向けインタラクティブマルチプレイヤーゲーム。メンバーと競い、ランキングを上りましょう。' },
        genshin:      { name: '原神',             description: '原神に関連するコマンド、ツール、独自コンテンツ。キャラクター、武器、イベントなどを検索。' },
        giveaways:    { name: 'ギブアウェイ',     description: '持続時間、参加条件、リアクション、自動当選ができるカスタムギブアウェイを作成・管理。' },
        matrimonio:   { name: '結婚',             description: 'ユーザー間の結婚・恋愛システム。プロポーズ、結婚、離婚し、サーバーにパートナーを表示。' },
        moderation:   { name: 'モデレーション',   description: '完全なモデレーションツール：BAN、キック、一時ミュート、警告、違反履歴、ロール管理。' },
        music:        { name: '音楽',             description: 'YouTube、Spotify、SoundCloudなどから高品質な音楽を再生。キュー、プレイリスト、インタラクティブパネル。' },
        security:     { name: 'セキュリティ',       description: 'レイド検知、新メンバー向キャプチャ、リンクフィルター、大量スパム対策でサーバーを守ります。' },
        sistemas:     { name: 'Sistemas',         description: 'ボットの高度な内部設定：サーバー設定、カスタムプレフィックス、言語、システム動作。' },
        social:       { name: 'ソーシャル',         description: 'アニメGIF付きソーシャルインタラクション：ハグ、パット、キス、挨拶など100以上のアクション。' },
        streaming:    { name: 'ストリーミング',   description: 'Twitch・YouTubeでライブ開始時に自動通知。チャンネルとロールごとにアラートを設定。' },
        systems:      { name: 'システム',           description: '高度な管理ツール：自動ロール、チャンネル管理、歓迎/退出メッセージ、サーバー全般設定。' },
        tickets:      { name: 'チケット',           description: 'プロ対応のサポートシステム：ユーザー専用プライベートチャンネル、カテゴリー、チャット記録、コントロールパネル。' },
        tools:        { name: 'ツール',             description: '実用ツール集：ユーザー・サーバー情報、時間計算、ウェブ検索、翻訳など山盛りの機能。' },
        utiility:     { name: 'ユーティリティ',   description: 'サーバー向けの補完ユーティリティ：リマインダー、投票、カスタム埋め込みなどの機能。' },
        verification: { name: '認証',             description: '新メンバーの認証システム：キャプチャ、質問、リアクション。認証後にロールを自動付与。' },
        voice:        { name: 'ボイス',             description: 'ダイナミックなボイスチャンネル管理、一時部屋の作成、人数制限、入屋権限の設定。' },
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
          title: '환영 시스템',
          description: '변수와 맞춤 스타일로 환영, 작별, 부스트 메시지를 제공합니다.',
          chips: ['변수', '임베드', '자동 역할'],
        },
        economy: {
          title: '경제',
          description: '90개 이상의 경제 명령어: 잔액, 상점, 작업, 채굴, 랭킹.',
          chips: ['랭킹', '상점', '보상'],
        },
        utilities: {
          title: '유틸리티',
          description: '자동화, 알림, 도구로 서버를 손쉽게 최신 상태로 유지합니다.',
          chips: ['알림', 'AFK', '정보'],
        },
        moderation: {
          title: '관리',
          description: '서버를 안전하고 정돈되게 유지하는 명확한 도구.',
          chips: ['안티 레이드', '로그', '필터'],
        },
        administration: {
          title: '서버 관리',
          description: '역할, 이모지, 채널, 권한을 손쉽게 관리하세요.',
          chips: ['역할', '이모지', '채널'],
        },
        music: {
          title: '음악',
          description: '대기열과 컨트롤이 있는 고품질 음악을 음성 채널에서 재생.',
          chips: ['대기열', '고품질', '컨트롤'],
        },
        fun: {
          title: '재미 & 게임',
          description: '미니게임, 퀴즈, 8볼 등으로 커뮤니티를 활기차게 만드세요.',
          chips: ['미니게임', '퀴즈', '8볼'],
        },
        roleplay: {
          title: '롤플레잉',
          description: '리액션, GIF, 카운터로 커뮤니티를 즐겁게 합니다.',
          chips: ['100+ 명령어', '카운터', '전 연령'],
        },
        voice: {
          title: '음성 채널',
          description: '커뮤니티를 위한 임시 및 맞춤 음성 채널을 만들고 관리하세요.',
          chips: ['임시', '맞춤', '자동'],
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
        economy:      { name: '경제',       description: '코인, 상점, 은행, 도박, 일일 보상이 포함된 완전한 가상 경제를 관리하세요. 서버 안에서 수익을 내고 소비하고 투자할 수 있습니다.' },
        fun:          { name: '허접',       description: '미니 게임, 퀴즈, 룰렛 등 다양한 오락 명령어로 커뮤니티를 활기차게 만들어보세요.' },
        games:        { name: '게임',       description: '서버 멤버들과 함께 즐기는 인터랙티브 멀티플레이어 게임. 경쟁하고 리더보드를 올라보세요.' },
        genshin:      { name: '원신',       description: '원신과 관련된 명령어, 도구 및 독점 콘텐츠. 캐릭터, 무기, 이벤트 등을 검색해보세요.' },
        giveaways:    { name: '추첨',       description: '기간, 참여 조건, 리액션, 자동 당첨자 선정이 있는 맞춤형 추첨을 만들고 관리하세요.' },
        matrimonio:   { name: '결혼',       description: '사용자 간 결혼 및 연애 시스템. 프러포즈, 결혼, 이혼하고 파트너를 서버에 표시하세요.' },
        moderation:   { name: '모더레이션', description: '밴, 킥, 임시 다운, 경고, 위반 이력 및 역할 관리가 포함된 완전한 모더레이션 도구.' },
        music:        { name: '음악',       description: 'YouTube, Spotify, SoundCloud 등에서 고품질 음악을 재생하세요. 큐, 플레이리스트, 오디오 필터, 인터랙티브 패널.' },
        security:     { name: '보안',       description: '레이드 감지, 신규 멤버 캡챠코드, 링크 필터, 대량 스팸 차단으로 서버를 보호하세요.' },
        sistemas:     { name: 'Sistemas',   description: '봇 고급 내부 설정: 서버별 설정, 커맨드 접두사, 언어, 시스템 동작.' },
        social:       { name: '소셜',       description: '애니메이션 GIF를 활용한 소셜 상호작용: 허그, 팔로우, 키스, 인사 등 100가지 이상의 액션.' },
        streaming:    { name: '스트리밍',   description: 'Twitch 또는 YouTube에서 라이브 시작 시 자동 알림. 채널 및 역할별로 알림을 설정하세요.' },
        systems:      { name: '시스템',     description: '고급 관리 도구: 자동 역할, 채널 관리, 환영/이별 메시지, 서버 전반 설정.' },
        tickets:      { name: '티켓',       description: '사용자별 전용 채널, 카테고리, 대화 기록, 지원 역할, 제어판이 포함된 전문 지원 시스템.' },
        tools:        { name: '도구',       description: '실용적인 도구 모음: 사용자 및 서버 정보, 시간 계산, 웹 검색, 번역 등 다양한 기능.' },
        utiility:     { name: '유틸리티',   description: '서버를 위한 추가 유틸리티 명령어: 리마인더, 투표, 커스텀 임베드 등.' },
        verification: { name: '인증',       description: '신규 멤버 인증 시스템: 캡챠코드, 질문 또는 리액션. 인증 성공 시 자동으로 역할 부여.' },
        voice:        { name: '음성',       description: '동적 음성 채널 관리, 임시 방 생성, 인원 제한, 입장 권한 설정.' },
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
