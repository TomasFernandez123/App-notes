import { authService } from "@/services/auth.service";
import { Models } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const current = await authService.getCurrent();
      setUser(current);
    } catch (error: any) {
      // 401 means no active session, which is expected behavior
      if (error?.code !== 401) {
        console.error("Error inesperado al cargar usuario:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      await loadUser();
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authService.register(email, password);
      await login(email, password);
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
