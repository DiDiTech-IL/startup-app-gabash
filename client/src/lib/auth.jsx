import { createContext, useContext, useEffect, useState } from "react";
import { authApi, usersApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    const token = localStorage.getItem("helpin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await usersApi.me();
      setUser(me);
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem("helpin_token");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signup(profile) {
    if (joining) return;
    setJoining(true);
    try {
      const res = await authApi.signup(profile);
      localStorage.setItem("helpin_token", res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setJoining(false);
    }
  }

  async function signin(credentials) {
    if (joining) return;
    setJoining(true);
    try {
      const res = await authApi.signin(credentials);
      localStorage.setItem("helpin_token", res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setJoining(false);
    }
  }

  function signout() {
    localStorage.removeItem("helpin_token");
    setUser(null);
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, joining, signup, signin, signout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
