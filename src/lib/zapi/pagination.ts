const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 50;

export interface ChatsPagination {
  page: number;
  pageSize: number;
}

export function parseChatsPagination(
  searchParams: URLSearchParams
): ChatsPagination {
  const page = positiveInteger(searchParams.get("page"), DEFAULT_PAGE);
  const pageSize = Math.min(
    positiveInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  return { page, pageSize };
}

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
