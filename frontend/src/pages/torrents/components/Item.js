import React, { useState } from "react";
import {
  Button,
  ButtonDropdown,
  ButtonGroup,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Progress,
} from "reactstrap";

const Items = ({ item, openModal, remove, openCopyModal }) => {
  const [isRenderDropdownOpen, setRenderDropdownOpen] = useState(false);
  const toggleRenderDropdownOpen = () =>
    setRenderDropdownOpen(!isRenderDropdownOpen);

  return (
    <ListGroupItem>
      <ListGroupItemHeading>{item.name}</ListGroupItemHeading>
      <ListGroupItemText>
        <Progress striped value={item.downloadedPerentage * 100}>
          {item.downloaded} ({item.downloadSpeed}b/s)
        </Progress>

        <ButtonGroup className="mt-3">
          <ButtonDropdown
            isOpen={isRenderDropdownOpen}
            toggle={toggleRenderDropdownOpen}
          >
            <Button color="success" onClick={() => openModal(item)}>
              Render
            </Button>
            <DropdownToggle color="success" split outline />
            <DropdownMenu>
              <DropdownItem onClick={() => openCopyModal(item)}>
                Copy URL
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
          <Button color="danger" onClick={() => remove(item.id)}>
            Delete
          </Button>
        </ButtonGroup>
      </ListGroupItemText>
    </ListGroupItem>
  );
};

export default Items;
