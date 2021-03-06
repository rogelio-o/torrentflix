import React from "react";
import { Col } from "reactstrap";

const ItemPageSection = ({ section, children }) => {
  return <Col md={section === "data" ? 9 : 3}>{children}</Col>;
};

export default ItemPageSection;
