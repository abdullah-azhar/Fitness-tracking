// Hand-written types mirroring supabase/schema.sql.
// If you evolve the schema with the Supabase CLI, regenerate this file with:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.types.ts

export type BloodMarkerFlag =
  | "low"
  | "normal"
  | "high"
  | "critical_low"
  | "critical_high";

export type InjectionSite = "abdomen" | "thigh" | "upper arm";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          height_cm: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          height_cm?: number | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          exercise: string;
          sets: number | null;
          reps: number | null;
          weight: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          exercise: string;
          sets?: number | null;
          reps?: number | null;
          weight?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
        Relationships: [];
      };
      workout_templates: {
        Row: {
          id: string;
          day_name: string;
          exercise_name: string;
          target_sets: number;
          target_rep_range_low: number;
          target_rep_range_high: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_name: string;
          exercise_name: string;
          target_sets: number;
          target_rep_range_low: number;
          target_rep_range_high: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["workout_templates"]["Insert"]
        >;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          meal_name: string;
          protein_g: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          meal_name: string;
          protein_g?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Insert"]>;
        Relationships: [];
      };
      meal_presets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          protein_g: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          protein_g: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["meal_presets"]["Insert"]>;
        Relationships: [];
      };
      water_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount_ml: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          amount_ml: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["water_logs"]["Insert"]>;
        Relationships: [];
      };
      body_metrics: {
        Row: {
          id: string;
          user_id: string;
          test_date: string;
          weight: number | null;
          skeletal_muscle: number | null;
          body_fat_pct: number | null;
          visceral_fat: number | null;
          bmi: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_date?: string;
          weight?: number | null;
          skeletal_muscle?: number | null;
          body_fat_pct?: number | null;
          visceral_fat?: number | null;
          bmi?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["body_metrics"]["Insert"]>;
        Relationships: [];
      };
      medication_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          dose_mg: number;
          injection_site: InjectionSite | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          dose_mg?: number;
          injection_site?: InjectionSite | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["medication_logs"]["Insert"]
        >;
        Relationships: [];
      };
      blood_markers: {
        Row: {
          id: string;
          user_id: string;
          test_date: string;
          marker_name: string;
          category: string;
          result: number;
          unit: string;
          flag: BloodMarkerFlag;
          ref_range_low: number | null;
          ref_range_high: number | null;
          ref_range_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_date?: string;
          marker_name: string;
          category?: string;
          result: number;
          unit: string;
          flag?: BloodMarkerFlag;
          ref_range_low?: number | null;
          ref_range_high?: number | null;
          ref_range_text?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["blood_markers"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
