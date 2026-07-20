/**
 * useOfflinePlan
 * Write-through AsyncStorage cache for the active plan.
 *
 * Data priority:  live API response → AsyncStorage cache → undefined
 * Cached data is used immediately once loaded from disk, regardless of
 * whether the network request is still in-flight or has errored.
 * The isOffline flag is only raised when the API has actually failed AND
 * we are falling back to the cache (so the banner doesn't flash on normal loads).
 */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useGetActivePlan,
  type GetActivePlanQueryResult,
} from '@workspace/api-client-react';

const CACHE_KEY = 'liftiq:active-plan';

interface OfflinePlanResult {
  plan: GetActivePlanQueryResult | undefined;
  isLoading: boolean;
  isError: boolean;
  isOffline: boolean;
  refetch: () => void;
  isRefetching: boolean;
}

export function useOfflinePlan(): OfflinePlanResult {
  const [cached, setCached] = useState<GetActivePlanQueryResult | undefined>(undefined);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Load cache from disk once on mount
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => { if (raw) setCached(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setCacheLoaded(true));
  }, []);

  const query = useGetActivePlan({});

  // Persist fresh live data whenever it arrives
  useEffect(() => {
    if (query.data) {
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(query.data)).catch(() => {});
    }
  }, [query.data]);

  // Always prefer live data; fall back to cache immediately once it's loaded
  const plan = query.data ?? cached;

  // Show spinner only when no data is available at all (neither live nor cache)
  const isLoading = !cacheLoaded || (!plan && query.isLoading);

  // Show hard error UI only when there's truly nothing to display
  const isError = !plan && query.isError;

  // Show offline banner only when the network has failed and cache is in use
  const isOffline = query.isError && !!cached;

  return {
    plan,
    isLoading,
    isError,
    isOffline,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
