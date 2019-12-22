import React from "react";
import { Container, Row } from "reactstrap";

const ItemPage = ({ children }) => {
  return (
    <Container>
      <Row>{children}</Row>
    </Container>
  );
};

export default ItemPage;
