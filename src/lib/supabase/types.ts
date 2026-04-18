/**
 * Tipos generados por `npm run db:types`.
 * Reemplazar este archivo con el output real una vez que el proyecto
 * de Supabase esté creado y las tablas aplicadas.
 *
 * Comando: npm run db:types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      exercises_catalog: {
        Row: {
          id: string;
          slug: string;
          name: string;
          name_alt: string | null;
          default_target_type: string;
          video_url: string | null;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          name_alt?: string | null;
          default_target_type: string;
          video_url?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          name_alt?: string | null;
          default_target_type?: string;
          video_url?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          harbiz_id: string | null;
          name: string;
          description: string | null;
          scheduled_date: string;
          status: "pending" | "completed";
          completed_at: string | null;
          effort_score: number | null;
          duration_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          harbiz_id?: string | null;
          name: string;
          description?: string | null;
          scheduled_date: string;
          status?: "pending" | "completed";
          completed_at?: string | null;
          effort_score?: number | null;
          duration_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          harbiz_id?: string | null;
          name?: string;
          description?: string | null;
          scheduled_date?: string;
          status?: "pending" | "completed";
          completed_at?: string | null;
          effort_score?: number | null;
          duration_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_sections: {
        Row: {
          id: string;
          workout_id: string;
          harbiz_id: string | null;
          title: string | null;
          description: string | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          workout_id: string;
          harbiz_id?: string | null;
          title?: string | null;
          description?: string | null;
          order_index: number;
        };
        Update: {
          id?: string;
          workout_id?: string;
          harbiz_id?: string | null;
          title?: string | null;
          description?: string | null;
          order_index?: number;
        };
      };
      blocks: {
        Row: {
          id: string;
          section_id: string;
          harbiz_id: string | null;
          type: "simple" | "superset" | "rest";
          rounds: number;
          rest_seconds: number | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          section_id: string;
          harbiz_id?: string | null;
          type: "simple" | "superset" | "rest";
          rounds?: number;
          rest_seconds?: number | null;
          order_index: number;
        };
        Update: {
          id?: string;
          section_id?: string;
          harbiz_id?: string | null;
          type?: "simple" | "superset" | "rest";
          rounds?: number;
          rest_seconds?: number | null;
          order_index?: number;
        };
      };
      exercises: {
        Row: {
          id: string;
          block_id: string;
          catalog_id: string | null;
          harbiz_id: string | null;
          order_index: number;
          sets: string | null;
          target_raw: string;
          target_type: string;
          target_parsed: Json | null;
          rest_seconds: number | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          block_id: string;
          catalog_id?: string | null;
          harbiz_id?: string | null;
          order_index: number;
          sets?: string | null;
          target_raw: string;
          target_type: string;
          target_parsed?: Json | null;
          rest_seconds?: number | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          block_id?: string;
          catalog_id?: string | null;
          harbiz_id?: string | null;
          order_index?: number;
          sets?: string | null;
          target_raw?: string;
          target_type?: string;
          target_parsed?: Json | null;
          rest_seconds?: number | null;
          notes?: string | null;
        };
      };
      exercise_logs: {
        Row: {
          id: string;
          exercise_id: string;
          catalog_id: string;
          workout_id: string;
          set_number: number;
          reps_done: number | null;
          weight_kg: number | null;
          duration_seconds: number | null;
          distance_meters: number | null;
          rpe: number | null;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          exercise_id: string;
          catalog_id: string;
          workout_id: string;
          set_number: number;
          reps_done?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          distance_meters?: number | null;
          rpe?: number | null;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          exercise_id?: string;
          catalog_id?: string;
          workout_id?: string;
          set_number?: number;
          reps_done?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          distance_meters?: number | null;
          rpe?: number | null;
          notes?: string | null;
          logged_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      workout_status: "pending" | "completed";
      block_type: "simple" | "superset" | "rest";
      target_type:
        | "reps"
        | "reps_range"
        | "reps_paired"
        | "pyramid"
        | "time"
        | "time_range"
        | "distance"
        | "mixed";
    };
  };
};
