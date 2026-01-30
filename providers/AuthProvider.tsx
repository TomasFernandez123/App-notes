import { authService } from "@/services/auth.service";
import { createContext, useContext, useEffect, useState } from "react";
import { Models } from "react-native-appwrite";

type UserWithProfile = Models.User<Models.Preferences> & {
  profileData?: any;
};

type AuthContextType = {
  user: UserWithProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>; // Agregamos fullName
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
      // Usamos la nueva función que trae todo
      const current = await authService.getUserData();
      setUser(current as UserWithProfile);
    } catch (error: any) {
      if (error?.code !== 401) console.error(error);
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

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    try {
      await authService.register(email, password, fullName);
      // No hace falta llamar a login() aquí porque authService ya lo hace internamente
      await loadUser();
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
