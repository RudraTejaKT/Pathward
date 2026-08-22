import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAuthToken } from "../api";

const AuthContext = createContext(null);
const TOKEN_KEY = "pathward_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        // Stored token is invalid/expired — clear it silently.
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { token: newToken, user: newUser } = await api.signup(name, email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Called after a successful payment verification so the "premium" badge
  // updates immediately without a full page reload.
  const refreshUser = useCallback(async () => {
    if (!token) return;
    const fresh = await api.me();
    setUser(fresh);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
