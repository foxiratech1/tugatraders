"use client";

/**
 * Shared Google Maps JavaScript API loader.
 *
 * - Uses the official @googlemaps/js-api-loader (dynamic library import).
 * - Calls `setOptions` exactly once per page load so the script is never injected twice.
 * - Only runs in the browser; callers must invoke it from effects / event handlers.
 *
 * The browser key is read from NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (inlined at build time).
 * Never log or render the key.
 */
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

/** Default map centre (Lisbon) – matches the existing trader-signup fallback. */
export const DEFAULT_MAP_CENTER = { lat: 38.7223, lng: -9.1393 };

/** Restrict autocomplete to Portugal. */
export const PLACES_REGION_CODES = ["pt"];

export const isGoogleMapsConfigured = () =>
  GOOGLE_MAPS_API_KEY.trim().length > 0 && !GOOGLE_MAPS_API_KEY.startsWith("YOUR_");

let optionsSet = false;

function ensureOptions() {
  if (optionsSet) return;
  setOptions({
    key: GOOGLE_MAPS_API_KEY,
    v: "weekly",
    language: "en",
    region: "PT",
  });
  optionsSet = true;
}

export class GoogleMapsConfigError extends Error {
  constructor() {
    super("Google Maps API key is not configured.");
    this.name = "GoogleMapsConfigError";
  }
}

export async function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (typeof window === "undefined") throw new Error("Google Maps can only load in the browser.");
  if (!isGoogleMapsConfigured()) throw new GoogleMapsConfigError();
  ensureOptions();
  return importLibrary("places");
}

export async function loadMapsLibraries(): Promise<{
  maps: google.maps.MapsLibrary;
  marker: google.maps.MarkerLibrary;
}> {
  if (typeof window === "undefined") throw new Error("Google Maps can only load in the browser.");
  if (!isGoogleMapsConfigured()) throw new GoogleMapsConfigError();
  ensureOptions();
  const [maps, marker] = await Promise.all([importLibrary("maps"), importLibrary("marker")]);
  return { maps, marker };
}

/** Structured location returned when the user picks a suggestion. */
export interface SelectedPlace {
  placeId: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export function parseAddressComponents(
  components: google.maps.places.AddressComponent[] | null | undefined
): Pick<SelectedPlace, "addressLine" | "city" | "state" | "postalCode" | "country"> {
  const get = (type: string) => components?.find((c) => c.types.includes(type));
  const streetNumber = get("street_number")?.longText || "";
  const route = get("route")?.longText || "";
  const addressLine = [route, streetNumber].filter(Boolean).join(" ") || undefined;
  const city =
    get("locality")?.longText ||
    get("postal_town")?.longText ||
    get("administrative_area_level_2")?.longText ||
    undefined;
  return {
    addressLine,
    city,
    state: get("administrative_area_level_1")?.longText || undefined,
    postalCode: get("postal_code")?.longText || undefined,
    country: get("country")?.longText || undefined,
  };
}
