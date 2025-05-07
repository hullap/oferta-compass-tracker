
export interface AdData {
  date: string;
  activeAds: number;
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
