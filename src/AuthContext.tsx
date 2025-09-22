import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = any;

type AuthContextValue = {
  user: AuthUser;
  setUser: React.Dispatch<React.SetStateAction<AuthUser>>;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Se não autorizado, remove token e limpa usuário
        localStorage.removeItem("token");
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.User);
    } catch (_err) {
      // Em caso de erro, remove token e limpa usuário
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, setUser, loading, refreshUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


