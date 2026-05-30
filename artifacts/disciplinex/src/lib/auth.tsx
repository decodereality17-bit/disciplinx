import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { profileStorage, type Profile } from './storage';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  created_at: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (name: string) => void;
}

const USERS_KEY = 'dx_users';
const SESSION_KEY = 'dx_session';

function hashPassword(password: string): string {
  return btoa(encodeURIComponent(password));
}

function loadUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getSession();
    if (userId) {
      const stored = loadUsers().find(u => u.id === userId);
      if (stored) {
        setUser({ id: stored.id, email: stored.email, name: stored.name });
        setProfile(profileStorage.get(stored.id));
      }
    }
    setLoading(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const users = loadUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      name: name.trim(),
      created_at: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const p = profileStorage.create(newUser.id, newUser.name);
    setSession(newUser.id);
    setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    setProfile(p);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const stored = loadUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() &&
           u.passwordHash === hashPassword(password)
    );
    if (!stored) throw new Error('Invalid email or password.');
    setSession(stored.id);
    setUser({ id: stored.id, email: stored.email, name: stored.name });
    setProfile(profileStorage.get(stored.id));
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback((name: string) => {
    if (!user) return;
    const updated = profileStorage.update(user.id, name);
    setProfile(updated);
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) { users[idx].name = name; saveUsers(users); }
    setUser(prev => prev ? { ...prev, name } : null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
