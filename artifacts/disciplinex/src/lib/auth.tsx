import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";

const LOCAL_USER = {
  id: "local-user",
  email: "local@disciplinex.app",
  app_metadata: {},
  user_metadata: { name: "" },
  aud: "authenticated",
  created_at: new Date(0).toISOString(),
} as unknown as User;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  configured: boolean;
  isLocal: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(supabaseConfigured ? null : LOCAL_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabaseConfigured) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabaseConfigured) return { error: null };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (!error && data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, name });
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!supabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      configured: supabaseConfigured,
      isLocal: !supabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
