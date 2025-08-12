import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gdnoynprtbhgzhppexaz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbm95bnBydGJoZ3pocHBleGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzY2MDIsImV4cCI6MjA3MDYxMjYwMn0._HWHaWmrU_CY0wjZaaBKZBS6GC5M9xnsY2z-L49tATg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
          user_id?: string | null;
        };
      };
      todos: {
        Row: {
          id: string;
          text: string;
          completed: boolean;
          total_time: number;
          tag_id: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          text: string;
          completed?: boolean;
          total_time?: number;
          tag_id?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          text?: string;
          completed?: boolean;
          total_time?: number;
          tag_id?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          todo_id: string;
          start_time: string;
          end_time: string;
          duration: number;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          todo_id: string;
          start_time: string;
          end_time: string;
          duration: number;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          todo_id?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          created_at?: string;
          user_id?: string | null;
        };
      };
    };
  };
}