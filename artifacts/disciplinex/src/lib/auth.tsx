import { createContext, useContext, type ReactNode } from "react";

const LOCAL_USER = { id: "local-user" } as const;

type AuthContextType = {
  user: typeof LOCAL_USER;
  clearData: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  function clearData() {
    if (!confirm("This will erase all your tasks, goals, and progress. Are you sure?")) return;
    localStorage.clear();
    window.location.reload();
  }

  return (
    <AuthContext.Provider value={{ user: LOCAL_USER, clearData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
