import { useState, useEffect, useCallback } from 'react';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  globalName: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  hasBot: boolean;
}

interface AuthState {
  user: DiscordUser | null;
  guilds: DiscordGuild[];
  accessToken: string | null;
  isLoading: boolean;
  isExchangingCode: boolean;
}

const STORAGE_KEY = 'moxi_auth_v1';

interface StoredAuth {
  user: DiscordUser;
  guilds: DiscordGuild[];
  accessToken: string;
}

function readStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function writeStorage(data: StoredAuth) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    guilds: [],
    accessToken: null,
    isLoading: true,
    isExchangingCode: false,
  });

  useEffect(() => {
    const stored = readStorage();

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Limpia el code de la URL de inmediato
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);

      setState((prev) => ({ ...prev, isExchangingCode: true, isLoading: true }));

      fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((res) => {
          if (!res.ok) return Promise.reject(new Error(`HTTP ${res.status}`));
          return res.json() as Promise<{ accessToken: string; user: DiscordUser; guilds: DiscordGuild[] }>;
        })
        .then((data) => {
          const toStore: StoredAuth = { user: data.user, guilds: data.guilds, accessToken: data.accessToken };
          writeStorage(toStore);
          // Redirigir al dashboard tras el login exitoso
          window.location.replace('/dashboard');
        })
        .catch(() => {
          setState((prev) => ({ ...prev, isLoading: false, isExchangingCode: false }));
        });
    } else if (stored) {
      setState({
        user: stored.user,
        guilds: stored.guilds,
        accessToken: stored.accessToken,
        isLoading: false,
        isExchangingCode: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setState({ user: null, guilds: [], accessToken: null, isLoading: false, isExchangingCode: false });
  }, []);

  const refreshGuilds = useCallback(async (token?: string) => {
    const t = token ?? state.accessToken;
    if (!t) return;
    try {
      const res = await fetch('/api/auth/guilds', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { guilds: DiscordGuild[] };
      setState((prev) => {
        if (!prev.user) return prev;
        const updated: StoredAuth = { user: prev.user, guilds: data.guilds, accessToken: t };
        writeStorage(updated);
        return { ...prev, guilds: data.guilds };
      });
    } catch {
      // ignore
    }
  }, [state.accessToken]);

  return { ...state, logout, refreshGuilds };
}
