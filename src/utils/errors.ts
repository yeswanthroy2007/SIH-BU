export class CoTravelerError extends Error {
  constructor(
    message: string,
    public code: 'AUTH_REQUIRED' | 'NO_TRIPS' | 'TRIP_NOT_FOUND' | 'EXISTING_REQUEST' | 'NETWORK_ERROR' | 'UNKNOWN',
    public userMessage: string
  ) {
    super(message);
    this.name = 'CoTravelerError';
  }
}