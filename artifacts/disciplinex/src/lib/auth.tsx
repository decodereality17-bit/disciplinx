import { createContext, useContext, useState, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Account = {
  email: string;
  name: string;
  passwordHash: string;
  created_at: string;
};

type Session = {
  email: string;
  name: string;
};

type AuthContextType = {
  user: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  clearData: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "dx-salt-2025");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getAccount(): Account | null {
  try {
    return JSON.parse(localStorage.getItem("dx_account") ?? "null");
  } catch {
    return null;
  }
}

function getSession(): Session | null {
  // New auth: dx_session
  try {
    const s = JSON.parse(localStorage.getItem("dx_session") ?? "null") as Session | null;
    if (typeof s?.email === "string" && s.email.length > 0) return s;
  } catch {}

  // Legacy migration: if dx_profile exists, auto-create a session so existing users
  // don't get logged out after the auth upgrade
  try {
    const p = JSON.parse(localStorage.getItem("dx_profile") ?? "null") as { name?: string } | null;
    if (typeof p?.name === "string" && p.name.trim().length > 0) {
      const session: Session = {
        email: `${p.name.toLowerCase().replace(/\s+/g, ".")}@local`,
        name: p.name,
      };
      localStorage.setItem("dx_session", JSON.stringify(session));
      return session;
    }
  } catch {}

  return null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(() => getSession());

  async function signUp(name: string, email: string, password: string) {
    const existing = getAccount();
    if (existing) throw new Error("An account already exists on this device. Please sign in.");
    const passwordHash = await hashPassword(password);
    const account: Account = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("dx_account", JSON.stringify(account));
    const profile = { id: "local-user", name: name.trim(), created_at: new Date().toISOString() };
    localStorage.setItem("dx_profile", JSON.stringify(profile));
    const session: Session = { email: account.email, name: account.name };
    localStorage.setItem("dx_session", JSON.stringify(session));
    setUser(session);
  }

  async function signIn(email: string, password: string) {
    const account = getAccount();
    if (!account) throw new Error("No account found. Please create an account first.");
    if (account.email !== email.toLowerCase().trim()) {
      throw new Error("Invalid email or password.");
    }
    const hash = await hashPassword(password);
    if (hash !== account.passwordHash) throw new Error("Invalid email or password.");
    const session: Session = { email: account.email, name: account.name };
    localStorage.setItem("dx_session", JSON.stringify(session));
    setUser(session);
  }

  function signOut() {
    localStorage.removeItem("dx_session");
    setUser(null);
  }

  function clearData() {
    if (!confirm("This will permanently erase all your tasks, goals, streaks, and progress. This cannot be undone. Are you sure?")) return;
    localStorage.clear();
    window.location.reload();
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, clearData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
