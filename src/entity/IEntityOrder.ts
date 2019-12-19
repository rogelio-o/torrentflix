export interface IEntityOrder {
  attribute: string;

  direction: Direction;
}

export enum Direction {
  ASC,
  DESC,
}
