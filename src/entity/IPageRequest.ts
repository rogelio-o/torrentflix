import { IEntityOrder } from "./IEntityOrder";

export interface IPageRequest {
  page: number;

  itemsPerPage: number;

  order?: IEntityOrder;

  q?: string;

  filterWatched?: boolean;
}
