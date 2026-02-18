import { createContext, useContext, useEffect, useState } from "react";
import { authApi, usersApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      let token = localStorage.getItem("helpin_token");
      if (!token) {
        const res = await authApi.loginAnonymous();
        token = res.token;
        localStorage.setItem("helpin_token", token);
        setUser(res.user);
      } else {
        const me = await usersApi.me();
        setUser(me);
      }
    } catch (err) {
      // Token invalid – get fresh one
      localStorage.removeItem("helpin_token");
      try {
        const res = await authApi.loginAnonymous();
        localStorage.setItem("helpin_token", res.token);
        setUser(res.user);
      } catch {
        console.error("Auth bootstrap failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
