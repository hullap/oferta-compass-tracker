
export interface AdData {
  date: string;
  activeAds: number;
  trend?: number; // Percentage change from previous day
  observation?: string; // Daily observations/notes
  time?: string; // Time of the data collection in HH:MM format
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  adData: AdData[];
  pageId?: string; // ID of the Facebook page
  pageName?: string; // Name of the Facebook page
  totalPageAds?: number; // Total ads count for the page (regardless of offer)
  keywords?: string[]; // Keywords/tags used to find the offer
  facebookAdLibraryUrl?: string; // URL to the Facebook Ad Library for this offer
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
  page_id?: string;
  page_name?: string;
  total_page_ads?: number;
  keywords?: string[];
  facebook_ad_library_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAdData {
  id: string;
  offer_id: string;
  date: string;
  active_ads: number;
  observation?: string;
  time?: string; // Time in HH:MM format
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
