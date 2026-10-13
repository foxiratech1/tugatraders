"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { DEFAULT_MAP_CENTER, isGoogleMapsConfigured, loadMapsLibraries } from "@/utils/googleMaps";

// Advanced markers require a Map ID. "DEMO_MAP_ID" works for development;
// set NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID to a real Map ID for production styling.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

interface LocationMapProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  /** Accessible label for the marker. */
  title?: string;
  zoom?: number;
  className?: string;
}

/**
 * Responsive Google Map with a single marker that follows the selected coordinates.
 * Renders nothing when Maps isn't configured, so forms keep working without a key.
 */
export default function LocationMap({
  latitude,
  longitude,
  title = "Selected location",
  zoom = 14,
  className = "h-[200px] sm:h-[240px]",
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [error, setError] = useState(false);

  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const configured = isGoogleMapsConfigured();

  // Create the map once.
  useEffect(() => {
    if (!configured || !containerRef.current || mapRef.current) return;
    let cancelled = false;
    loadMapsLibraries()
      .then(({ maps, marker }) => {
        if (cancelled || !containerRef.current) return;
        const center = hasCoords ? { lat: latitude as number, lng: longitude as number } : DEFAULT_MAP_CENTER;
        mapRef.current = new maps.Map(containerRef.current, {
          center,
          zoom: hasCoords ? zoom : 7,
          mapId: MAP_ID,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          clickableIcons: false,
        });
        markerRef.current = new marker.AdvancedMarkerElement({
          map: hasCoords ? mapRef.current : null,
          position: hasCoords ? center : null,
          title,
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  // Move marker / recenter when coordinates change.
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (hasCoords) {
      const pos = { lat: latitude as number, lng: longitude as number };
      marker.position = pos;
      marker.map = map;
      map.panTo(pos);
      map.setZoom(zoom);
    } else {
      marker.map = null;
    }
  }, [latitude, longitude, hasCoords, zoom]);

  if (!configured) return null;

  if (error) {
    return (
      <div className={`flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F7F9F6] text-[12px] text-[#6B7280] ${className}`}>
        <MapPin size={14} className="text-[#9CA3AF]" /> Map preview is unavailable right now.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={title}
      className={`w-full overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#F1F7E8] ${className}`}
    />
  );
}
