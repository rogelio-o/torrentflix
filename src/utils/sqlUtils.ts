import { Direction, IEntityOrder } from "../entity/IEntityOrder";

export const parseSqlOrder = (order?: IEntityOrder): string => {
  if (order) {
    const direction = order.direction === Direction.ASC ? "ASC" : "DESC";

    return ` ORDER BY ${order.attribute} ${direction}`;
  } else {
    return "";
  }
};
