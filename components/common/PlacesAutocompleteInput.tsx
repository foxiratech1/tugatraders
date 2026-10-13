"use client";

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MapPin } from "lucide-react";
import {
  GoogleMapsConfigError,
  PLACES_REGION_CODES,
  SelectedPlace,
  isGoogleMapsConfigured,
  loadPlacesLibrary,
  parseAddressComponents,
} from "@/utils/googleMaps";

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
}

export interface PlacesAutocompleteInputProps {
  value: string;
  /** Fires on every keystroke (manual entry stays supported). */
  onChange: (value: string) => void;
  /**
   * Fires with the resolved place when a suggestion is chosen, and with `null`
   * when the user edits the text afterwards (coordinates no longer match).
   */
  onPlaceSelect?: (place: SelectedPlace | null) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Classes applied to the <input>. Pass the field's existing styles here. */
  inputClassName?: string;
  /** Classes applied to the relative wrapper around the input. */
  className?: string;
  /** Optional element rendered inside the wrapper (e.g. an absolutely positioned icon). */
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  /** Restrict to specific place types, e.g. ["(regions)"] for towns/postcodes. */
  includedPrimaryTypes?: string[];
  debounceMs?: number;
  minChars?: number;
}

type Status = "idle" | "loading" | "ready" | "empty" | "error";

export default function PlacesAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  id,
  name,
  required,
  disabled,
  inputClassName = "",
  className = "",
  leftAdornment,
  rightAdornment,
  includedPrimaryTypes,
  debounceMs = 300,
  minChars = 2,
}: PlacesAutocompleteInputProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const placesRef = useRef<google.maps.PlacesLibrary | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSelectionRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [resolving, setResolving] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const enabled = isGoogleMapsConfigured();

  useEffect(() => setMounted(true), []);

  // Keep the portal dropdown aligned with the input.
  const updateRect = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open, updateRect]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapperRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const getPlaces = async () => {
    if (!placesRef.current) placesRef.current = await loadPlacesLibrary();
    return placesRef.current;
  };

  const fetchSuggestions = useCallback(
    async (input: string) => {
      const requestId = ++requestIdRef.current;
      setStatus("loading");
      setOpen(true);
      try {
        const places = await getPlaces();
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new places.AutocompleteSessionToken();
        }
        const request: google.maps.places.AutocompleteRequest = {
          input,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: PLACES_REGION_CODES,
          language: "en",
          region: "pt",
        };
        if (includedPrimaryTypes?.length) request.includedPrimaryTypes = includedPrimaryTypes;

        const { suggestions: raw } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        if (requestId !== requestIdRef.current) return; // stale response

        const mapped: Suggestion[] = raw
          .map((s) => s.placePrediction)
          .filter((p): p is google.maps.places.PlacePrediction => !!p)
          .map((p) => ({
            placeId: p.placeId,
            mainText: p.mainText?.text || p.text.text,
            secondaryText: p.secondaryText?.text || "",
            prediction: p,
          }));

        setSuggestions(mapped);
        setActiveIndex(-1);
        setStatus(mapped.length ? "ready" : "empty");
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setStatus("error");
        setErrorMessage(
          err instanceof GoogleMapsConfigError
            ? "Address suggestions are not configured."
            : "Address suggestions are temporarily unavailable."
        );
        if (process.env.NODE_ENV !== "production") {
          // Log only the error type – never the user's address or the API key.
          console.warn("[PlacesAutocomplete] suggestions failed:", (err as Error)?.name || "Error");
        }
      }
    },
    [includedPrimaryTypes]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(next);

    if (hasSelectionRef.current) {
      hasSelectionRef.current = false;
      onPlaceSelect?.(null);
    }

    if (!enabled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < minChars) {
      requestIdRef.current++;
      setSuggestions([]);
      setStatus("idle");
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(next.trim()), debounceMs);
  };

  const selectSuggestion = async (s: Suggestion) => {
    setOpen(false);
    setSuggestions([]);
    setStatus("idle");
    const fallbackText = s.secondaryText ? `${s.mainText}, ${s.secondaryText}` : s.mainText;
    onChange(fallbackText);
    setResolving(true);
    try {
      const place = s.prediction.toPlace();
      await place.fetchFields({ fields: ["formattedAddress", "location", "addressComponents"] });
      const formatted = place.formattedAddress || fallbackText;
      const selected: SelectedPlace = {
        placeId: s.placeId,
        formattedAddress: formatted,
        latitude: place.location?.lat() ?? null,
        longitude: place.location?.lng() ?? null,
        ...parseAddressComponents(place.addressComponents),
      };
      onChange(formatted);
      hasSelectionRef.current = true;
      onPlaceSelect?.(selected);
    } catch (err) {
      // Keep the typed text; coordinates are simply unavailable.
      hasSelectionRef.current = true;
      onPlaceSelect?.({ placeId: s.placeId, formattedAddress: fallbackText, latitude: null, longitude: null });
      if (process.env.NODE_ENV !== "production") {
        console.warn("[PlacesAutocomplete] place details failed:", (err as Error)?.name || "Error");
      }
    } finally {
      // A session ends once place details are fetched.
      sessionTokenRef.current = null;
      setResolving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || status !== "ready") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = enabled && open && status !== "idle" && rect;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {leftAdornment}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={!!showDropdown}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        required={required}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length || status === "empty" || status === "error") setOpen(true);
        }}
        className={inputClassName}
      />
      {resolving ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E9625] pointer-events-none">
          <Loader2 size={14} className="animate-spin" />
        </div>
      ) : (
        rightAdornment
      )}

      {mounted &&
        showDropdown &&
        createPortal(
          <ul
            ref={dropdownRef}
            id={listId}
            role="listbox"
            style={{ position: "fixed", top: rect.top, left: rect.left, width: Math.max(rect.width, 260) }}
            className="z-[1000] max-h-[280px] overflow-y-auto rounded-[12px] border border-[#E5E7EB] bg-white py-1.5 shadow-[0_12px_32px_rgba(36,58,36,0.14)] text-left"
          >
            {status === "loading" && (
              <li className="flex items-center gap-2 px-4 py-3 text-[13px] text-[#6B7280]">
                <Loader2 size={14} className="animate-spin text-[#6E9625]" /> Searching addresses…
              </li>
            )}
            {status === "empty" && (
              <li className="px-4 py-3 text-[13px] text-[#6B7280]">
                No matching addresses found. You can keep your typed location.
              </li>
            )}
            {status === "error" && (
              <li className="px-4 py-3 text-[13px] text-[#B45309]">
                {errorMessage} You can still type your location manually.
              </li>
            )}
            {status === "ready" &&
              suggestions.map((s, i) => (
                <li
                  key={s.placeId}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex cursor-pointer items-start gap-2.5 px-4 py-2.5 transition-colors ${
                    i === activeIndex ? "bg-[#F1F7E8]" : "hover:bg-[#F7F9F6]"
                  }`}
                >
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-[#6E9625]" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold text-[#1C2C1C]">{s.mainText}</span>
                    {s.secondaryText && (
                      <span className="block truncate text-[12px] text-[#6B7280]">{s.secondaryText}</span>
                    )}
                  </span>
                </li>
              ))}
            {status === "ready" && (
              <li className="px-4 pt-1.5 pb-1 text-right text-[10px] text-[#9CA3AF]">Powered by Google</li>
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}
