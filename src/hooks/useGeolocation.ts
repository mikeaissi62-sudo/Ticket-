'use client';

import { useState, useEffect, useCallback } from 'react';
import { STATIONS, Station } from '@/lib/mock-data';

interface GeoPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  requestPermission: () => void;
  getNearestStation: () => Station | null;
  getStationsSortedByDistance: () => (Station & { distance: number })[];
  getDistanceToStation: (station: Station) => number | null;
}

/**
 * Calculate the Haversine distance between two GPS coordinates in km.
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Accès à la localisation refusé. Activez-la dans vos paramètres.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position indisponible. Vérifiez votre connexion GPS.');
            break;
          case err.TIMEOUT:
            setError('Délai de localisation dépassé. Réessayez.');
            break;
          default:
            setError('Erreur de géolocalisation inconnue.');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache 5 minutes
      }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator) return;
    // Check if permission was previously granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          requestPermission();
        }
      }).catch(() => {
        // permissions API not fully supported, skip auto-request
      });
    }
  }, [requestPermission]);

  const getDistanceToStation = useCallback(
    (station: Station): number | null => {
      if (!position) return null;
      return Math.round(haversineDistance(position.lat, position.lng, station.lat, station.lng) * 10) / 10;
    },
    [position]
  );

  const getStationsSortedByDistance = useCallback(() => {
    if (!position) {
      return STATIONS.map((s) => ({ ...s, distance: 0 }));
    }
    return STATIONS.map((s) => ({
      ...s,
      distance: haversineDistance(position.lat, position.lng, s.lat, s.lng),
    })).sort((a, b) => a.distance - b.distance);
  }, [position]);

  const getNearestStation = useCallback((): Station | null => {
    if (!position) return null;
    const sorted = getStationsSortedByDistance();
    return sorted.length > 0 ? sorted[0] : null;
  }, [position, getStationsSortedByDistance]);

  return {
    position,
    error,
    loading,
    requestPermission,
    getNearestStation,
    getStationsSortedByDistance,
    getDistanceToStation,
  };
}
