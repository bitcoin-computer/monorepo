export declare const LIST_PAGE_SIZE = 10000
export declare function readPages<T>(
  window: {
    limit?: number
    offset?: number
  },
  fetchPage: (page: { limit: number; offset: number }) => Promise<readonly T[]>,
): Promise<T[]>
