import { slugify } from "@/lib/slug";

/** Official 39 Istanbul districts (alphabetical, tr-TR). */
export const ISTANBUL_DISTRICTS = [
  "Adalar",
  "Arnavutköy",
  "Ataşehir",
  "Avcılar",
  "Bağcılar",
  "Bahçelievler",
  "Bakırköy",
  "Başakşehir",
  "Bayrampaşa",
  "Beşiktaş",
  "Beykoz",
  "Beylikdüzü",
  "Beyoğlu",
  "Büyükçekmece",
  "Çatalca",
  "Çekmeköy",
  "Esenler",
  "Esenyurt",
  "Eyüpsultan",
  "Fatih",
  "Gaziosmanpaşa",
  "Güngören",
  "Kadıköy",
  "Kağıthane",
  "Kartal",
  "Küçükçekmece",
  "Maltepe",
  "Pendik",
  "Sancaktepe",
  "Sarıyer",
  "Silivri",
  "Sultanbeyli",
  "Sultangazi",
  "Şile",
  "Şişli",
  "Tuzla",
  "Ümraniye",
  "Üsküdar",
  "Zeytinburnu",
] as const;

export type IstanbulDistrictName = (typeof ISTANBUL_DISTRICTS)[number];

export const ISTANBUL_DISTRICT_OPTIONS = ISTANBUL_DISTRICTS.map((name) => ({
  name,
  slug: slugify(name),
}));

/** Rough geographic lock for the city (SW / NE). */
export const ISTANBUL_MAP_BOUNDS = {
  southWest: [40.75, 27.9] as [number, number],
  northEast: [41.55, 29.95] as [number, number],
};

export const ISTANBUL_MAP_CENTER: [number, number] = [41.06, 28.98];
export const ISTANBUL_DISTRICTS_GEOJSON_URL = "/geo/istanbul-districts.geojson";
