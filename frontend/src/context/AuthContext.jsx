import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAuthToken } from "../api";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const TOKEN_KEY = "pathward_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Monitor Supabase Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error && session?.user) {
        setSupabaseUser(session.user);
        setSupabaseConnected(true);
      } else if (!error) {
        setSupabaseConnected(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

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
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    // 1. Authenticate with backend API
    const { token: newToken, user: newUser } = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);

    // 2. Concurrently connect to Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error && error.message.includes("Invalid login")) {
        // If user exists in SQLite but not in Supabase yet, create in Supabase
        await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: newUser.name, role: newUser.role } },
        });
      } else if (data?.user) {
        setSupabaseUser(data.user);
      }
    } catch (err) {
      console.warn("Supabase Auth sync notice:", err.message);
    }

    return newUser;
  }, []);

  const signup = useCallback(async (name, email, password, role = "trainee") => {
    // 1. Register with backend API
    const { token: newToken, user: newUser } = await api.signup(name, email, password, role);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);

    // 2. Concurrently create Supabase Auth user
    try {
      const { data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      });
      if (data?.user) {
        setSupabaseUser(data.user);
      }
    } catch (err) {
      console.warn("Supabase Signup sync notice:", err.message);
    }

    return newUser;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setSupabaseUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const fresh = await api.me();
    setUser(fresh);
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
