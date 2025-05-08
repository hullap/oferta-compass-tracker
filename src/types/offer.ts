
export interface AdData {
  date: string;
  activeAds: number;
  trend?: number; // Percentage change from previous day
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  adData: AdData[];
  createdAt: string;
  updatedAt: string;
}

export type ScoreResult = "high" | "medium" | "low";

export interface Score {
  value: number;
  label: string;
  result: ScoreResult;
}

export interface TrendInfo {
  direction: "up" | "down" | "stable";
  percentage: number;
}

export interface DatabaseOffer {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAdData {
  id: string;
  offer_id: string;
  date: string;
  active_ads: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  offer_id: string;
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}
