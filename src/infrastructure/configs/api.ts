export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://gr4-swp-be2-sp25.onrender.com";

export const API_ENDPOINTS = {
  allStations: "/api/Station/AllStations",
};

export function buildUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
