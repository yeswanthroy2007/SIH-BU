import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useConvexAuth } from 'convex/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface CoTravelerButtonProps {
  placeId?: string;
  stateName?: string;
  placeName?: string;
}

interface ErrorState {
  code: 'AUTH_REQUIRED' | 'NO_TRIPS' | 'TRIP_NOT_FOUND' | 'EXISTING_REQUEST' | 'UNKNOWN' | 'SUCCESS';
  message: string;
}

export function CoTravelerButton({ placeId, stateName, placeName }: CoTravelerButtonProps) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  
  // Initialize mutations and queries with error handling
  const sendTripRequest = useMutation(api.tripRequests.sendTripRequest);
  const tripsResult = useQuery(api.trips.getAllTrips, { status: "open" });
  const userRequestsResult = useQuery(api.tripRequests.getUserRequests);
  
  const trips = (tripsResult || []) as typeof tripsResult;
  const userRequests = (userRequestsResult || []) as typeof userRequestsResult;
  
  // Make sure we have either placeId or stateName to search for
  if (!placeId && !stateName) {
    console.error('CoTravelerButton requires either placeId or stateName prop');
    return null;
  }
  
  const destination = placeName || stateName;
  if (!destination) {
    console.error('CoTravelerButton requires a destination name');
    return null;
  }

  // Find relevant trip
  const relevantTrip = trips?.find(trip => 
    (placeId && trip.destination === placeId) || 
    (stateName && trip.destination === stateName)
  ) || null;

  // Check for existing request
  const hasExistingRequest = userRequests?.some(request => 
    request.tripId === relevantTrip?._id
  ) ?? false;

  const handleClick = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Check auth
      if (!isAuthenticated) {
        // Navigate to sign-in page with redirect back to current page
        const redirect = `${location.pathname}${location.search || ''}`;
        toast.info('Please sign in to find co-travelers');
        navigate(`/signin?redirect=${encodeURIComponent(redirect)}`);
        return;
      }

      // Check trips
      if (!trips || trips.length === 0) {
        setError({
          code: 'NO_TRIPS',
          message: 'No trips are currently available. Please try again later.'
        });
        toast.info('No trips are currently available. Please try again later.');
        return;
      }

      // Check relevant trip
      if (!relevantTrip?._id) {
        setError({
          code: 'TRIP_NOT_FOUND',
          message: 'No trips are currently available for this destination.'
        });
        toast.info('No trips found for this destination yet.');
        return;
      }

      // Check existing request
      if (hasExistingRequest) {
        setError({
          code: 'EXISTING_REQUEST',
          message: 'You already have an active co-traveler request for this destination'
        });
        toast.info('You already have an active co-traveler request for this destination');
        return;
      }

      // Send request
      await sendTripRequest({
        tripId: relevantTrip._id,
        message: `Interested in joining trip to ${destination}`
      });

      // Success state
      setError({ code: 'SUCCESS', message: 'Your co-traveler request has been posted!' });
      toast.success('Your co-traveler request has been posted!');
    } catch (err) {
      console.error('Failed to send co-traveler request:', err);
      setError({
        code: 'UNKNOWN',
        message: 'An unexpected error occurred. Please try again later.'
      });
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the button if we don't have required data
  if (!placeId && !stateName) {
    return null;
  }

  // Different button states based on current status
  const getButtonProps = () => {
    // Initial loading state
    if (authLoading || !trips || !userRequests) {
      return {
        variant: "outline" as const,
        disabled: true,
        text: 'Loading...',
        showSpinner: true
      };
    }

    // Success states
    if (error?.code === 'SUCCESS' || hasExistingRequest) {
      return {
        variant: "secondary" as const,
        disabled: true,
        text: '✓ Co-Traveler Request Posted',
        showSpinner: false
      };
    }

    // Error states with actions
    if (error?.code === 'AUTH_REQUIRED') {
      return {
        variant: "default" as const,
        disabled: false,
        text: 'Sign in to Find Co-Travelers',
        showSpinner: false
      };
    }

    if (!trips || trips.length === 0) {
      return {
        variant: "secondary" as const,
        disabled: true,
        text: 'No Trips Available',
        showSpinner: false
      };
    }

    // Loading state during action
    if (isLoading) {
      return {
        variant: "default" as const,
        disabled: true,
        text: 'Posting Request...',
        showSpinner: true
      };
    }

    // Default state
    return {
      variant: "default" as const,
      disabled: false,
      text: 'Find Co-Travelers',
      showSpinner: false
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleClick} 
        disabled={buttonProps.disabled}
        variant={buttonProps.variant}
        className="w-full mt-4"
      >
        {buttonProps.showSpinner && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {buttonProps.text}
      </Button>
      
      {/* Error message display */}
      {error && error.code !== 'SUCCESS' && (
        <p className={`text-sm ${
          error.code === 'AUTH_REQUIRED' ? 'text-blue-600' : 
          error.code === 'NO_TRIPS' ? 'text-yellow-600' : 
          'text-red-600'
        } text-center`}>
          {error.message}
        </p>
      )}

      {/* Create Trip CTA when no trips exist or not found for destination */}
      {(error?.code === 'TRIP_NOT_FOUND' || error?.code === 'NO_TRIPS') && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const dest = encodeURIComponent(destination);
            const ret = encodeURIComponent(`${location.pathname}${location.search || ''}`);
            navigate(`/trips/create?destination=${dest}&return=${ret}`);
          }}
        >
          Create Trip for {destination}
        </Button>
      )}

      {/* Success message */}
      {error?.code === 'SUCCESS' && (
        <p className="text-sm text-green-600 text-center">
          {error.message}
        </p>
      )}
    </div>
  );
}