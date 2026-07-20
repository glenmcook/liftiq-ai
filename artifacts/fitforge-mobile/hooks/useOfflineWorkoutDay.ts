/**
 * useOfflineWorkoutDay
 * Write-through AsyncStorage cache for a single workout day, keyed by dayId.
 *
 * Data priority:  live API response → AsyncStorage cache → undefined
 * Cached data is used immediately once loaded from disk, regardless of
 * whether the network request is still in-flight or has errored.
 * Switching dayId resets cached state immediately so a different day's
 * content can never bleed through while the new cache key loads.
 */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useGetWorkoutDay,
  type GetWorkoutDayQueryResult,
} from '@workspace/api-client-react';

interface OfflineWorkoutDayResult {
  day: GetWorkoutDayQueryResult | undefined;
  isLoading: boolean;
  isError: boolean;
  isOffline: boolean;
}

export function useOfflineWorkoutDay(dayId: number): OfflineWorkoutDayResult {
  const cacheKey = `liftiq:workout-day:${dayId}`;

  const [cached, setCached] = useState<GetWorkoutDayQueryResult | undefined>(undefined);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Reset immediately on dayId change so we never show the previous day's data.
  // setCached(undefined) fires synchronously before the async disk read resolves.
  useEffect(() => {
    if (!dayId) {
      setCached(undefined);
      setCacheLoaded(true);
      return;
    }

    setCached(undefined);
    setCacheLoaded(false);

    let cancelled = false;
    AsyncStorage.getItem(cacheKey)
      .then((raw) => { if (!cancelled && raw) setCached(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCacheLoaded(true); });

    return () => { cancelled = true; };
  }, [cacheKey, dayId]);

  const query = useGetWorkoutDay(dayId);

  // Persist fresh live data for this dayId
  useEffect(() => {
    if (query.data) {
      AsyncStorage.setItem(cacheKey, JSON.stringify(query.data)).catch(() => {});
    }
  }, [query.data, cacheKey]);

  // Always prefer live data; fall back to cache immediately once loaded
  const day = query.data ?? cached;

  // Spinner only when there's no data at all
  const isLoading = !cacheLoaded || (!day && query.isLoading);

  // Hard error only when neither live data nor cache is available
  const isError = !day && query.isError;

  // Offline banner only when network has failed and cache is serving content
  const isOffline = query.isError && !!cached;

  return { day, isLoading, isError, isOffline };
}
