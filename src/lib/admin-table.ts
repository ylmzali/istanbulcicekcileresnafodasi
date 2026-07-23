export const ADMIN_TABLE_DEFAULT_PAGE_SIZE = 10;

export type AdminTableQuery = {
  page: number;
  pageSize: number;
  skip: number;
};

export type AdminTableResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parseAdminTableQuery(
  searchParams: Record<string, string | string[] | undefined>,
  options?: { defaultPageSize?: number },
): AdminTableQuery {
  const defaultPageSize = options?.defaultPageSize ?? ADMIN_TABLE_DEFAULT_PAGE_SIZE;
  const rawPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const rawSize = Array.isArray(searchParams.pageSize)
    ? searchParams.pageSize[0]
    : searchParams.pageSize;

  const page = Math.max(1, Number(rawPage) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(rawSize) || defaultPageSize));

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0]?.trim() || "";
  return value?.trim() || "";
}

export function buildAdminTableHref(
  basePath: string,
  params: Record<string, string | number | undefined | null>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    const text = String(value).trim();
    if (!text) continue;
    if (key === "page" && text === "1") continue;
    query.set(key, text);
  }
  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function toAdminTableResult<T>(
  rows: T[],
  total: number,
  query: AdminTableQuery,
): AdminTableResult<T> {
  return {
    rows,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}
