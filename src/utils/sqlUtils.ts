import { Direction, IEntityOrder } from "../entity/IEntityOrder";

export const parseSqlOrder = (
  order?: IEntityOrder,
  attributePrefix?: string,
): string => {
  if (order) {
    const direction = order.direction === Direction.ASC ? "ASC" : "DESC";
    const fullAttributePrefix = attributePrefix ? `${attributePrefix}.` : "";

    return ` ORDER BY ${fullAttributePrefix}${order.attribute} ${direction}`;
  } else {
    return "";
  }
};

export const parseSqlLimit = (offset?: number, limit?: number): string => {
  if (offset && limit) {
    return ` LIMIT ${offset},${limit}`;
  } else if (limit) {
    return ` LIMIT 0,${limit}`;
  } else {
    return "";
  }
};
