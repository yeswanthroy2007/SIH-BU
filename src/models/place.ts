export interface Place {
  _id: string;
  state: string;
  stateCode: string;
  place_name: string;
  category: string;
  description?: string;
  timings?: string;
  entry_fee?: string;
  best_time?: string;
  nearest_railway?: string;
  nearest_bus?: string;
  nearest_airport?: string;
  metro_station?: string;
  accessibility?: string;
  guided_tours?: string;
  parking?: string;
  nearby_amenities?: string;
  official_website?: string;
  wikipedia?: string;
  special_notes?: string;
}
