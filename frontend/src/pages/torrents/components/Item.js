import React from "react";
import { Button, ButtonGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Progress } from "reactstrap";

const Items = ({ item, openModal, remove }) => {
  return (
    <ListGroupItem>
      <ListGroupItemHeading>{item.name}</ListGroupItemHeading>
      <ListGroupItemText>
        <Progress striped value={item.downloadedPerentage * 100}>
          {item.downloaded} ({item.downloadSpeed}b/s)
        </Progress>

        <ButtonGroup className="mt-3">
          <Button color="success" onClick={() => openModal(item)}>
            Render
          </Button>
          <Button color="danger" onClick={() => remove(item.id)}>
            Delete
          </Button>
        </ButtonGroup>
      </ListGroupItemText>
    </ListGroupItem>
  );
};

export default Items;
