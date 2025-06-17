// Database and environment types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			coordinate: {
				Row: {
					heading: number | null;
					horizontal_accuracy: number | null;
					id: number;
					journey_id: string;
					latitude: number;
					longitude: number;
					timestamp: string;
				};
				Insert: {
					heading?: number | null;
					horizontal_accuracy?: number | null;
					id?: number;
					journey_id: string;
					latitude: number;
					longitude: number;
					timestamp?: string;
				};
				Update: {
					heading?: number | null;
					horizontal_accuracy?: number | null;
					id?: number;
					journey_id?: string;
					latitude?: number;
					longitude?: number;
					timestamp?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'coordinate_journey_id_fkey';
						columns: ['journey_id'];
						referencedRelation: 'journey';
						referencedColumns: ['id'];
					}
				];
			};
			journey: {
				Row: {
					avg_speed: number | null;
					distance: number | null;
					end_time: string | null;
					id: string;
					start_time: string;
					user_id: number;
				};
				Insert: {
					avg_speed?: number | null;
					distance?: number | null;
					end_time?: string | null;
					id?: string;
					start_time: string;
					user_id: number;
				};
				Update: {
					avg_speed?: number | null;
					distance?: number | null;
					end_time?: string | null;
					id?: string;
					start_time?: string;
					user_id?: number;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

export interface Env {
	SUPABASE_URL: string;
	SUPABASE_API_KEY: string;
	BOT_TOKEN: string;
}

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Journey = Tables<'journey'>;
export type Coordinate = Tables<'coordinate'>;
