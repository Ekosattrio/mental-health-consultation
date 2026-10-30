export const cardsPerRailPage = (width: number): number => width >= 960 ? 3 : width >= 600 ? 2 : 1;

export function railPagination(count: number, perPage: number, requestedPage: number) {
  const pages = Math.max(1, Math.ceil(count / perPage));
  const page = Math.max(0, Math.min(pages - 1, requestedPage));
  return {pages, page, first: count ? page * perPage + 1 : 0, last: Math.min(count, (page + 1) * perPage)};
}
