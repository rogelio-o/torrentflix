import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardDeck, CardImg, CardSubtitle, CardText, CardTitle } from "reactstrap";
import Button from "reactstrap-button-loader";

const groupByN = (n, data) => {
  let result = [];
  for (let i = 0; i < data.length; i += n) {
    result.push(data.slice(i, i + n));
  }
  return result;
};

const ItemsList = ({ items }) => {
  const groupedItems = groupByN(3, items);

  return (
    <div>
      {groupedItems.map((itemsGroup) => (
        <CardDeck className="items-list">
          {itemsGroup.map((item) => (
            <Card className="mb-3">
              <CardImg top width="100%" src={item.image} alt={item.title} />
              <CardBody>
                <CardTitle>
                  {item.link ? (
                    <Link to={item.link}>{item.title}</Link>
                  ) : (
                    item.title
                  )}
                </CardTitle>
                {item.subtitle ? (
                  <CardSubtitle>{item.subtitle}</CardSubtitle>
                ) : (
                  undefined
                )}
                <CardText>{item.text}</CardText>
                {item.buttons ? (
                  <div>
                    {item.buttons.map((button) => (
                      <Button
                        color={button.color || "default"}
                        onClick={button.onClick}
                        className="mr-sm-2"
                      >
                        {button.text}
                      </Button>
                    ))}
                  </div>
                ) : (
                  undefined
                )}
              </CardBody>
            </Card>
          ))}
        </CardDeck>
      ))}
    </div>
  );
};

export default ItemsList;
