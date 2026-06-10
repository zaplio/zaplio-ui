import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as loginApi,
  register as registerApi,
  logoutRequest,
} from "../services/auth";
import { TOKEN_STORAGE_KEY } from "../services/config";
import type { RegisterPayload, User } from "../services/types";

interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(loadSession());
    setIsLoading(false);

    // Listen untuk refresh token dari authFetch (http.ts).
    const onRefresh = () => {
      setSession(loadSession());
    };
    window.addEventListener("auth:token-refreshed", onRefresh);
    return () => window.removeEventListener("auth:token-refreshed", onRefresh);
  }, []);

  const persist = useCallback((s: AuthSession | null) => {
    setSession(s);
    if (s) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(s));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginApi(username, password);
      persist({
        user: res.user,
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        expiresAt: res.expires_at,
      });
    },
    [persist]
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    return registerApi(payload);
  }, []);

  const logout = useCallback(() => {
    if (session?.accessToken) {
      logoutRequest(session.accessToken);
    }
    persist(null);
  }, [persist, session]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: !!session?.accessToken,
      isLoading,
      login,
      register,
      logout,
    }),
    [session, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
