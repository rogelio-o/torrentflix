export interface IPage<T> {
  currentPage: number;

  totalPages: number;

  numItems: number;

  itemsPerPage: number;

  items: T[];
}
