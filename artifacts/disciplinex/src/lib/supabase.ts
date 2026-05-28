import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string | null; created_at: string };
        Insert: { id: string; name?: string | null };
        Update: { name?: string | null };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject: string;
          duration: number;
          created_at: string;
          completed_at: string | null;
          done: boolean;
          goal_id: string | null;
          created_at_ts: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subject: string;
          duration: number;
          created_at?: string;
          completed_at?: string | null;
          done?: boolean;
          goal_id?: string | null;
        };
        Update: {
          title?: string;
          subject?: string;
          duration?: number;
          completed_at?: string | null;
          done?: boolean;
          goal_id?: string | null;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target: number;
          deadline: string | null;
          created_at: string;
          created_at_ts: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target: number;
          deadline?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          target?: number;
          deadline?: string | null;
        };
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: string | null;
          intent: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          mood?: string | null;
          intent?: number | null;
        };
        Update: {
          mood?: string | null;
          intent?: number | null;
        };
      };
    };
  };
};
