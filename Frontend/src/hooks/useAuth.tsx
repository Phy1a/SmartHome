import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getMe } from "../utils/api";
import type { User, Level, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | null>(null);

const LEVELS: Level[] = ["débutant", "intermédiaire", "avancé", "expert"];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((res: { data: User }) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token: string, userData: User): void => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const getLevel = (): Level => (user?.level as Level) ?? "débutant";

  const canAccess = (minLevel: Level): boolean => {
    const userIdx = LEVELS.indexOf(getLevel());
    const reqIdx = LEVELS.indexOf(minLevel);
    return userIdx >= reqIdx;
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, loginUser, logout, canAccess, getLevel }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
