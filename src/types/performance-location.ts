export type PerformanceType = 'onair' | 'offair';

export interface PerformanceLocation {
  id: string;
  title: string;
  type: PerformanceType;
  venue_name: string;
  city: string;
  province?: string | null;
  latitude: number;
  longitude: number;
  event_date: string;
  end_date?: string | null;
  summary?: string | null;
  description?: string | null;
  photo_url?: string | null;
  source_url?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceLocationFilters {
  type: 'all' | PerformanceType;
  year: string; // 'all' or specific year e.g. '2024'
  searchQuery: string;
}
