import React from "react";
import { Card, CardBody, CardGroup, CardImg, CardSubtitle, CardText, CardTitle } from "reactstrap";
import Button from "reactstrap-button-loader";

const ItemsList = ({ loading, handleSubmit, items }) => {
  return (
    <CardGroup className="items-list">
      {items.map((item) => (
        <Card>
          <CardImg top width="100%" src={item.image} alt={item.title} />
          <CardBody>
            <CardTitle>{item.title}</CardTitle>
            {item.subtitle ? (
              <CardSubtitle>{item.subtitle}</CardSubtitle>
            ) : (
              undefined
            )}
            <CardText>{item.text}</CardText>
            {item.onClick ? (
              <Button onClick={item.onClick}>{item.button}</Button>
            ) : (
              undefined
            )}
          </CardBody>
        </Card>
      ))}
    </CardGroup>
  );
};

export default ItemsList;
