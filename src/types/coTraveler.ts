export interface TripRequest {
  _id: string;
  userId: string;
  tripId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  maxTravelers?: number;
  currentTravelers?: number;
  status: 'open' | 'closed' | 'completed';
  description?: string;
  preferences?: {
    ageRange?: string;
    gender?: string;
    interests?: string[];
  };
  createdAt: number;
}

export type TripRequestStatus = 'pending' | 'accepted' | 'rejected';
export type TripStatus = 'open' | 'closed' | 'completed';