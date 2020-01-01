import "./ItemPage.css";

import React from "react";
import { Container, Row } from "reactstrap";

const ItemPage = ({ backdrop, children }) => {
  return (
    <div className="item-page">
      <div
        className="item-page-backdrop"
        style={{ backgroundImage: `url(${backdrop})` }}
      />
      <Container className="item-page-inner">
        <Row>{children}</Row>
      </Container>
    </div>
  );
};

export default ItemPage;
