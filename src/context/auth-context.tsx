import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe } from "@/services/api/user";
import { clearTokens, getAccessToken } from "@/services/api/token-storage";

type User = Awaited<ReturnType<typeof getMe>>;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const currentUser = await getMe();

      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  async function initializeAuth() {
    try {
      const accessToken =
        await getAccessToken();

      if (!accessToken) {
        setUser(null);
        return;
      }

      await refreshUser();
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await clearTokens();

    setUser(null);
  }

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}