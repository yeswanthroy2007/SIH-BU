import { api } from "../../convex/_generated/api";
import type { Trip, TripRequest } from "../types/coTraveler";
import { CoTravelerError } from "./errors";
import type { FunctionReference } from "convex/server";

export class CoTravelerService {
  constructor(
    private readonly mutations: {
      sendTripRequest: (args: { tripId: string; message: string }) => Promise<string>;
    },
    private readonly queries: {
      getAllTrips: (args: { status: 'open' }) => Trip[] | undefined;
      getUserRequests: () => TripRequest[] | undefined;
    }
  ) {}

  static fromConvex() {
    return new CoTravelerService(
      {
        sendTripRequest: async (args) => {
          const result = await api.tripRequests.sendTripRequest(args);
          return result;
        },
      },
      {
        getAllTrips: async (args) => {
          const result = await api.trips.getAllTrips(args);
          return result || [];
        },
        getUserRequests: async () => {
          const result = await api.tripRequests.getUserRequests();
          return result || [];
        },
      }
    );
  }

  async findRelevantTrip(destination: string): Promise<Trip | undefined> {
    try {
      const trips = await this.queries.getAllTrips({ status: 'open' });
      return trips?.find(trip => trip.destination === destination);
    } catch (error) {
      console.error('Error finding relevant trip:', error);
      throw new CoTravelerError(
        'Failed to find relevant trips',
        'NETWORK_ERROR',
        'Unable to check for available trips. Please try again later.'
      );
    }
  }

  async checkExistingRequest(userId: string | null, tripId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const requests = await this.queries.getUserRequests();
      return requests?.some(request => request.tripId === tripId) ?? false;
    } catch (error) {
      console.error('Error checking existing request:', error);
      throw new CoTravelerError(
        'Failed to check existing requests',
        'NETWORK_ERROR',
        'Unable to verify your existing requests. Please try again later.'
      );
    }
  }

  async sendTripRequest(args: {
    userId: string | null;
    tripId: string;
    destination: string;
    existingRequest: boolean;
  }): Promise<void> {
    const { userId, tripId, destination, existingRequest } = args;

    // Authentication check
    if (!userId) {
      throw new CoTravelerError(
        'User not authenticated',
        'AUTH_REQUIRED',
        'Please sign in to find co-travelers'
      );
    }

    // Existing request check
    if (existingRequest) {
      throw new CoTravelerError(
        'Request already exists',
        'EXISTING_REQUEST',
        'You already have an active co-traveler request for this destination'
      );
    }

    try {
      await this.mutations.sendTripRequest({
        tripId,
        message: `Interested in joining trip to ${destination}`
      });
    } catch (error) {
      console.error('Error sending trip request:', error);
      throw new CoTravelerError(
        'Failed to send trip request',
        'NETWORK_ERROR',
        'Unable to send your request. Please try again later.'
      );
    }
  }
}