"use client";

import {
  ISTANBUL_DISTRICTS_GEOJSON_URL,
  ISTANBUL_MAP_BOUNDS,
  ISTANBUL_MAP_CENTER,
} from "@/lib/istanbul-districts";
import { slugify } from "@/lib/slug";
import { useEffect, useRef, useState } from "react";

type IstanbulMapProps = {
  districtSlug?: string;
  className?: string;
  title?: string;
};

type DistrictFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  { name?: string }
>;

function ringToLatLng(ring: number[][]): [number, number][] {
  return ring.map(([lng, lat]) => [lat, lng]);
}

function collectDistrictHoles(
  geojson: DistrictFeatureCollection,
): [number, number][][] {
  const holes: [number, number][][] = [];

  for (const feature of geojson.features) {
    const geometry = feature.geometry;
    if (!geometry) continue;

    if (geometry.type === "Polygon") {
      const outer = geometry.coordinates[0];
      if (outer?.length) holes.push(ringToLatLng(outer));
      continue;
    }

    for (const polygon of geometry.coordinates) {
      const outer = polygon[0];
      if (outer?.length) holes.push(ringToLatLng(outer));
    }
  }

  return holes;
}

export function IstanbulMap({
  districtSlug = "",
  className,
  title = "İstanbul ilçe haritası",
}: IstanbulMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const districtsLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const container = containerRef.current;
      if (!container || mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const response = await fetch(ISTANBUL_DISTRICTS_GEOJSON_URL);
      if (!response.ok || cancelled) return;
      const geojson = (await response.json()) as DistrictFeatureCollection;
      if (cancelled) return;

      const bounds = L.latLngBounds(
        ISTANBUL_MAP_BOUNDS.southWest,
        ISTANBUL_MAP_BOUNDS.northEast,
      );

      const map = L.map(container, {
        center: ISTANBUL_MAP_CENTER,
        zoom: 10,
        minZoom: 9,
        maxZoom: 15,
        maxBounds: bounds.pad(0.05),
        maxBoundsViscosity: 1,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const holes = collectDistrictHoles(geojson);
      L.polygon(
        [
          [
            [90, -180],
            [90, 180],
            [-90, 180],
            [-90, -180],
          ],
          ...holes,
        ],
        {
          stroke: false,
          fillColor: "#F7F8F5",
          fillOpacity: 0.84,
          interactive: false,
          pane: "overlayPane",
        },
      ).addTo(map);

      const districtsLayer = L.geoJSON(geojson, {
        style: () => ({
          color: "#0E5A39",
          weight: 1.25,
          opacity: 0.9,
          fillColor: "#0E5A39",
          fillOpacity: 0.1,
        }),
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name;
          if (!name) return;
          layer.bindTooltip(name, {
            sticky: true,
            direction: "top",
            opacity: 0.95,
            className: "istanbul-district-tooltip",
          });
        },
      }).addTo(map);

      map.fitBounds(districtsLayer.getBounds().pad(0.04));
      mapRef.current = map;
      districtsLayerRef.current = districtsLayer;
      if (!cancelled) setMapReady(true);

      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    }

    void init();

    return () => {
      cancelled = true;
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      districtsLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    const layer = districtsLayerRef.current;
    if (!map || !layer) return;

    let matched: import("leaflet").Layer | null = null;

    layer.eachLayer((districtLayer) => {
      const feature = (
        districtLayer as import("leaflet").Layer & {
          feature?: GeoJSON.Feature<
            GeoJSON.Geometry,
            { name?: string }
          >;
        }
      ).feature;
      const name = feature?.properties?.name ?? "";
      const isActive = Boolean(districtSlug) && slugify(name) === districtSlug;

      if ("setStyle" in districtLayer) {
        (districtLayer as import("leaflet").Path).setStyle(
          isActive
            ? {
                color: "#0B3D28",
                weight: 2.4,
                fillColor: "#0E5A39",
                fillOpacity: 0.28,
              }
            : {
                color: "#0E5A39",
                weight: 1.25,
                fillColor: "#0E5A39",
                fillOpacity: 0.1,
              },
        );
      }

      if (isActive) matched = districtLayer;
    });

    if (matched && "getBounds" in matched) {
      map.fitBounds(
        (matched as import("leaflet").FeatureGroup).getBounds().pad(0.18),
        { maxZoom: 12 },
      );
      return;
    }

    if (!districtSlug) {
      map.fitBounds(layer.getBounds().pad(0.04));
    }
  }, [districtSlug, mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    const timer = window.setTimeout(onResize, 80);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, [mapReady]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={title}
    />
  );
}
