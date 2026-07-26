"use client";

import { useEffect } from "react";
import { useSiteSearch } from "@/components/layout/site-search";

/** Opens the global search dialog when landing on /arama. */
export function SiteSearchPageOpener() {
  const { openSearch } = useSiteSearch();

  useEffect(() => {
    openSearch();
  }, [openSearch]);

  return null;
}
