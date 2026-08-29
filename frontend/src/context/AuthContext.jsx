import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAuthToken } from "../api";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const TOKEN_KEY = "backlox_token";
const USER_KEY = "backlox_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [loading, setLoading] = useState(!user);

  // Monitor Supabase Auth Session
  useEffect(() => {
    try {
      if (supabase && supabase.auth) {
        supabase.auth.getSession()
          .then(({ data, error }) => {
            if (!error && data?.session?.user) {
              setSupabaseUser(data.session.user);
              setSupabaseConnected(true);
            } else if (!error) {
              setSupabaseConnected(true);
            }
          })
          .catch((err) => {
            console.warn("Supabase session check notice:", err?.message || err);
          });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          setSupabaseUser(session?.user || null);
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    } catch (e) {
      console.warn("Supabase init notice:", e?.message || e);
    }
  }, []);

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      setLoading(false);
      return;
    }

    api
      .me()
      .then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        }
      })
      .catch((err) => {
        // Only invalidate session if token is truly invalid/rejected (401)
        if (err?.message?.includes("Invalid or expired") || err?.message?.includes("Not logged in") || err?.message?.includes("401")) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    // 1. Authenticate with backend API
    const { token: newToken, user: newUser } = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);

    // 2. Concurrently connect to Supabase Auth
    try {
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error && error.message.includes("Invalid login")) {
          await supabase.auth.signUp({
            email,
            password,
            options: { data: { name: newUser.name, role: newUser.role } },
          });
        } else if (data?.user) {
          setSupabaseUser(data.user);
        }
      }
    } catch (err) {
      console.warn("Supabase Auth sync notice:", err.message);
    }

    return newUser;
  }, []);

  const signup = useCallback(async (payloadOrName, email, password, role = "trainee") => {
    const payload = typeof payloadOrName === "object"
      ? payloadOrName
      : { name: payloadOrName, email, password, role };

    // 1. Register with backend API
    const { token: newToken, user: newUser } = await api.signup(payload);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);

    // 2. Concurrently create Supabase Auth user
    try {
      if (supabase && supabase.auth) {
        const { data } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              name: payload.name,
              role: payload.role || "trainee",
              phone: payload.phone,
              gender: payload.gender,
              education: payload.education,
              institution: payload.institution,
            },
          },
        });
        if (data?.user) {
          setSupabaseUser(data.user);
        }
      }
    } catch (err) {
      console.warn("Supabase Signup sync notice:", err.message);
    }

    return newUser;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setSupabaseUser(null);
    try {
      if (supabase && supabase.auth) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const fresh = await api.me();
      if (fresh) {
        setUser(fresh);
        localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      }
    } catch (e) {
      console.warn("Failed to refresh user profile:", e.message);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        supabaseUser,
        supabaseConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
