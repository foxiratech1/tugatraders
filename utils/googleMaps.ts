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
  area?: string;
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

export const PORTUGAL_CITIES: Record<string, { city: string; postalCode: string; area: string }> = {
  lisbon: { city: "Lisbon", postalCode: "1000-001", area: "Grande Lisboa, Lisboa" },
  lisboa: { city: "Lisboa", postalCode: "1000-001", area: "Grande Lisboa, Lisboa" },
  porto: { city: "Porto", postalCode: "4000-001", area: "Grande Porto, Porto" },
  amadora: { city: "Amadora", postalCode: "2700-001", area: "Grande Lisboa, Lisboa" },
  braga: { city: "Braga", postalCode: "4700-001", area: "Cávado, Braga" },
  funchal: { city: "Funchal", postalCode: "9000-001", area: "Ilha da Madeira, Madeira" },
  coimbra: { city: "Coimbra", postalCode: "3000-001", area: "Região de Coimbra, Coimbra" },
  setubal: { city: "Setúbal", postalCode: "2900-001", area: "Península de Setúbal, Setúbal" },
  almada: { city: "Almada", postalCode: "2800-001", area: "Península de Setúbal, Setúbal" },
  cascais: { city: "Cascais", postalCode: "2750-001", area: "Grande Lisboa, Lisboa" },
  sintra: { city: "Sintra", postalCode: "2710-001", area: "Grande Lisboa, Lisboa" },
  oeiras: { city: "Oeiras", postalCode: "2780-001", area: "Grande Lisboa, Lisboa" },
  guimaraes: { city: "Guimarães", postalCode: "4800-001", area: "Ave, Braga" },
  aveiro: { city: "Aveiro", postalCode: "3800-001", area: "Região de Aveiro, Aveiro" },
  evora: { city: "Évora", postalCode: "7000-001", area: "Alentejo Central, Évora" },
  faro: { city: "Faro", postalCode: "8000-001", area: "Algarve, Faro" },
  portimao: { city: "Portimão", postalCode: "8500-001", area: "Algarve, Faro" },
  albufeira: { city: "Albufeira", postalCode: "8200-001", area: "Algarve, Faro" },
  lagos: { city: "Lagos", postalCode: "8600-001", area: "Algarve, Faro" },
  loule: { city: "Loulé", postalCode: "8100-001", area: "Algarve, Faro" },
  quarteira: { city: "Quarteira", postalCode: "8125-001", area: "Loulé, Algarve" },
  vilamoura: { city: "Vilamoura", postalCode: "8125-401", area: "Loulé, Algarve" },
  tavira: { city: "Tavira", postalCode: "8800-001", area: "Algarve, Faro" },
  olhao: { city: "Olhão", postalCode: "8700-001", area: "Algarve, Faro" },
  silves: { city: "Silves", postalCode: "8300-001", area: "Algarve, Faro" },
  leiria: { city: "Leiria", postalCode: "2400-001", area: "Região de Leiria, Leiria" },
  viseu: { city: "Viseu", postalCode: "3500-001", area: "Dão-Lafões, Viseu" },
  vianadocastelo: { city: "Viana do Castelo", postalCode: "4900-001", area: "Alto Minho, Viana do Castelo" },
  matosinhos: { city: "Matosinhos", postalCode: "4450-001", area: "Grande Porto, Porto" },
  maia: { city: "Maia", postalCode: "4470-001", area: "Grande Porto, Porto" },
  gondomar: { city: "Gondomar", postalCode: "4420-001", area: "Grande Porto, Porto" },
  valongo: { city: "Valongo", postalCode: "4440-001", area: "Grande Porto, Porto" },
  vilanovadegaia: { city: "Vila Nova de Gaia", postalCode: "4400-001", area: "Grande Porto, Porto" },
  odivelas: { city: "Odivelas", postalCode: "2675-001", area: "Grande Lisboa, Lisboa" },
  loures: { city: "Loures", postalCode: "2670-001", area: "Grande Lisboa, Lisboa" },
  barreiro: { city: "Barreiro", postalCode: "2830-001", area: "Península de Setúbal, Setúbal" },
  seixal: { city: "Seixal", postalCode: "2840-001", area: "Península de Setúbal, Setúbal" },
  moita: { city: "Moita", postalCode: "2860-001", area: "Península de Setúbal, Setúbal" },
  montijo: { city: "Montijo", postalCode: "2870-001", area: "Península de Setúbal, Setúbal" },
  sesimbra: { city: "Sesimbra", postalCode: "2970-001", area: "Península de Setúbal, Setúbal" },
  palmela: { city: "Palmela", postalCode: "2950-001", area: "Península de Setúbal, Setúbal" },
  vilafrancadexira: { city: "Vila Franca de Xira", postalCode: "2600-001", area: "Grande Lisboa, Lisboa" },
  torresvedras: { city: "Torres Vedras", postalCode: "2560-001", area: "Oeste, Lisboa" },
  mafra: { city: "Mafra", postalCode: "2640-001", area: "Grande Lisboa, Lisboa" },
  ericeira: { city: "Ericeira", postalCode: "2655-001", area: "Mafra, Lisboa" },
  santarem: { city: "Santarém", postalCode: "2000-001", area: "Lezíria do Tejo, Santarém" },
  tomar: { city: "Tomar", postalCode: "2300-001", area: "Médio Tejo, Santarém" },
  abrantes: { city: "Abrantes", postalCode: "2200-001", area: "Médio Tejo, Santarém" },
  torresnovas: { city: "Torres Novas", postalCode: "2350-001", area: "Médio Tejo, Santarém" },
  entroncamento: { city: "Entroncamento", postalCode: "2330-001", area: "Médio Tejo, Santarém" },
  caldasdarainha: { city: "Caldas da Rainha", postalCode: "2500-001", area: "Oeste, Leiria" },
  peniche: { city: "Peniche", postalCode: "2520-001", area: "Oeste, Leiria" },
  obidos: { city: "Óbidos", postalCode: "2510-001", area: "Oeste, Leiria" },
  alcobaca: { city: "Alcobaça", postalCode: "2460-001", area: "Oeste, Leiria" },
  nazare: { city: "Nazaré", postalCode: "2450-001", area: "Oeste, Leiria" },
  marinhagrande: { city: "Marinha Grande", postalCode: "2430-001", area: "Região de Leiria, Leiria" },
  pombal: { city: "Pombal", postalCode: "3100-001", area: "Região de Leiria, Leiria" },
  figueiradafoz: { city: "Figueira da Foz", postalCode: "3080-001", area: "Região de Coimbra, Coimbra" },
  cantanhede: { city: "Cantanhede", postalCode: "3060-001", area: "Região de Coimbra, Coimbra" },
  montemorovelho: { city: "Montemor-o-Velho", postalCode: "3140-001", area: "Região de Coimbra, Coimbra" },
  lousa: { city: "Lousã", postalCode: "3200-001", area: "Região de Coimbra, Coimbra" },
  oliveiradeazemeis: { city: "Oliveira de Azeméis", postalCode: "3720-001", area: "Entre Douro e Vouga, Aveiro" },
  santamariadafeira: { city: "Santa Maria da Feira", postalCode: "4520-001", area: "Entre Douro e Vouga, Aveiro" },
  saojoaodamadeira: { city: "São João da Madeira", postalCode: "3700-001", area: "Entre Douro e Vouga, Aveiro" },
  ovar: { city: "Ovar", postalCode: "3880-001", area: "Região de Aveiro, Aveiro" },
  ilhavo: { city: "Ílhavo", postalCode: "3830-001", area: "Região de Aveiro, Aveiro" },
  agueda: { city: "Águeda", postalCode: "3750-001", area: "Região de Aveiro, Aveiro" },
  espinho: { city: "Espinho", postalCode: "4500-001", area: "Grande Porto, Aveiro" },
  povoadevarzim: { city: "Póvoa de Varzim", postalCode: "4490-001", area: "Grande Porto, Porto" },
  viladoconde: { city: "Vila do Conde", postalCode: "4480-001", area: "Grande Porto, Porto" },
  santotirso: { city: "Santo Tirso", postalCode: "4780-001", area: "Área Metropolitana do Porto, Porto" },
  trofa: { city: "Trofa", postalCode: "4785-001", area: "Área Metropolitana do Porto, Porto" },
  pacosdeferreira: { city: "Paços de Ferreira", postalCode: "4590-001", area: "Tâmega e Sousa, Porto" },
  paredes: { city: "Paredes", postalCode: "4580-001", area: "Tâmega e Sousa, Porto" },
  penafiel: { city: "Penafiel", postalCode: "4560-001", area: "Tâmega e Sousa, Porto" },
  amarante: { city: "Amarante", postalCode: "4600-001", area: "Tâmega e Sousa, Porto" },
  vilanovadefamalicao: { city: "Vila Nova de Famalicão", postalCode: "4760-001", area: "Ave, Braga" },
  famalicao: { city: "Vila Nova de Famalicão", postalCode: "4760-001", area: "Ave, Braga" },
  barcelos: { city: "Barcelos", postalCode: "4750-001", area: "Cávado, Braga" },
  esposende: { city: "Esposende", postalCode: "4740-001", area: "Cávado, Braga" },
  fafe: { city: "Fafe", postalCode: "4820-001", area: "Ave, Braga" },
  pontedelima: { city: "Ponte de Lima", postalCode: "4990-001", area: "Alto Minho, Viana do Castelo" },
  valenca: { city: "Valença", postalCode: "4930-001", area: "Alto Minho, Viana do Castelo" },
  moncao: { city: "Monção", postalCode: "4950-001", area: "Alto Minho, Viana do Castelo" },
  castelobranco: { city: "Castelo Branco", postalCode: "6000-001", area: "Beira Baixa, Castelo Branco" },
  covilha: { city: "Covilhã", postalCode: "6200-001", area: "Cova da Beira, Castelo Branco" },
  fundao: { city: "Fundão", postalCode: "6230-001", area: "Cova da Beira, Castelo Branco" },
  guarda: { city: "Guarda", postalCode: "6300-001", area: "Beiras e Serra da Estrela, Guarda" },
  seia: { city: "Seia", postalCode: "6270-001", area: "Serra da Estrela, Guarda" },
  braganca: { city: "Bragança", postalCode: "5300-001", area: "Trás-os-Montes, Bragança" },
  mirandela: { city: "Mirandela", postalCode: "5370-001", area: "Trás-os-Montes, Bragança" },
  chaves: { city: "Chaves", postalCode: "5400-001", area: "Alto Tâmega, Vila Real" },
  vilareal: { city: "Vila Real", postalCode: "5000-001", area: "Douro, Vila Real" },
  pesodaregua: { city: "Peso da Régua", postalCode: "5050-001", area: "Douro, Vila Real" },
  lamego: { city: "Lamego", postalCode: "5100-001", area: "Douro, Viseu" },
  tondela: { city: "Tondela", postalCode: "3460-001", area: "Dão-Lafões, Viseu" },
  mangualde: { city: "Mangualde", postalCode: "3530-001", area: "Dão-Lafões, Viseu" },
  beja: { city: "Beja", postalCode: "7800-001", area: "Baixo Alentejo, Beja" },
  serpa: { city: "Serpa", postalCode: "7830-001", area: "Baixo Alentejo, Beja" },
  sines: { city: "Sines", postalCode: "7520-001", area: "Alentejo Litoral, Setúbal" },
  santiagodocacem: { city: "Santiago do Cacém", postalCode: "7540-001", area: "Alentejo Litoral, Setúbal" },
  grandola: { city: "Grândola", postalCode: "7570-001", area: "Alentejo Litoral, Setúbal" },
  alcacerdosal: { city: "Alcácer do Sal", postalCode: "7580-001", area: "Alentejo Litoral, Setúbal" },
  portalegre: { city: "Portalegre", postalCode: "7300-001", area: "Alto Alentejo, Portalegre" },
  elvas: { city: "Elvas", postalCode: "7350-001", area: "Alto Alentejo, Portalegre" },
  estremoz: { city: "Estremoz", postalCode: "7100-001", area: "Alentejo Central, Évora" },
  montemoronovo: { city: "Montemor-o-Novo", postalCode: "7050-001", area: "Alentejo Central, Évora" },
  vendasnovas: { city: "Vendas Novas", postalCode: "7080-001", area: "Alentejo Central, Évora" },
  pontadelgada: { city: "Ponta Delgada", postalCode: "9500-001", area: "Ilha de São Miguel, Açores" },
  angradoheroismo: { city: "Angra do Heroísmo", postalCode: "9700-001", area: "Ilha Terceira, Açores" },
  horta: { city: "Horta", postalCode: "9900-001", area: "Ilha do Faial, Açores" },
  portosanto: { city: "Porto Santo", postalCode: "9400-001", area: "Porto Santo, Madeira" },
};

/**
 * Resolves city, postal code, and relevant area from prediction texts.
 */
export function resolveLocationDetails(
  text: string,
  secondaryText?: string
): { city: string; postalCode?: string; area?: string } {
  const combined = `${text} ${secondaryText || ""}`;

  // 1. Check for postal code in text: e.g. 1000-001 or 1234
  const pcMatch = combined.match(/\b\d{4}-\d{3}\b/) || combined.match(/\b\d{4}\b/);
  const foundPostalCode = pcMatch ? (pcMatch[0].length === 4 ? `${pcMatch[0]}-001` : pcMatch[0]) : undefined;

  // 2. Clean text to check known Portuguese cities
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const parts = [text, secondaryText || ""].flatMap((p) => p.split(",").map((s) => s.trim()));

  for (const part of parts) {
    const key = normalize(part);
    if (PORTUGAL_CITIES[key]) {
      const match = PORTUGAL_CITIES[key];
      return {
        city: match.city,
        postalCode: foundPostalCode || match.postalCode,
        area: match.area,
      };
    }
  }

  // 3. Fallback extraction:
  const cleanSecondary = (secondaryText || "").replace(/,\s*Portugal$/i, "").replace(/^Portugal$/i, "").trim();
  const city = parts[0] || text;
  const area = cleanSecondary || (parts.length > 1 ? parts.slice(1).join(", ") : undefined);

  return {
    city,
    postalCode: foundPostalCode,
    area: area || undefined,
  };
}
