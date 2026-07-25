"use client";

import { useMemo } from "react";
import { Field, TextSelect } from "@/components/admin/form-fields";

export type LocationCityOption = {
  id: string;
  name: string;
  districts: Array<{ id: string; name: string }>;
};

type LocationFieldsProps = {
  cities: LocationCityOption[];
  /** Kept in DB; not shown in the form UI. */
  countryCode?: string;
  /** Kept in DB; not shown in the form UI. Defaults to İstanbul when empty. */
  cityId?: string;
  districtId?: string;
  onDistrictChange?: (value: string) => void;
  onDistrictBlur?: () => void;
  required?: boolean;
  error?: string | null;
  labels: {
    district: string;
  };
};

function resolveDefaultCityId(
  cities: LocationCityOption[],
  cityId: string,
  districtId: string,
) {
  if (cityId) return cityId;

  const fromDistrict = cities.find((city) =>
    city.districts.some((district) => district.id === districtId),
  )?.id;
  if (fromDistrict) return fromDistrict;

  return (
    cities.find((city) => city.name === "İstanbul")?.id ?? cities[0]?.id ?? ""
  );
}

export function LocationFields({
  cities,
  countryCode = "TR",
  cityId = "",
  districtId = "",
  onDistrictChange,
  onDistrictBlur,
  required = false,
  error,
  labels,
}: LocationFieldsProps) {
  const resolvedCityId = resolveDefaultCityId(cities, cityId, districtId);

  const districts = useMemo(() => {
    return (
      cities.find((city) => city.id === resolvedCityId)?.districts ?? []
    );
  }, [cities, resolvedCityId]);

  return (
    <div className="flex flex-wrap gap-3">
      <input type="hidden" name="countryCode" value={countryCode || "TR"} />
      <input type="hidden" name="cityId" value={resolvedCityId} />
      <Field
        label={labels.district}
        htmlFor="districtId"
        size="lg"
        required={required}
        error={error}
      >
        <TextSelect
          id="districtId"
          name="districtId"
          value={districtId}
          onChange={(event) => onDistrictChange?.(event.target.value)}
          onBlur={onDistrictBlur}
          disabled={!resolvedCityId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "districtId-error" : undefined}
        >
          <option value="">—</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </TextSelect>
      </Field>
    </div>
  );
}
