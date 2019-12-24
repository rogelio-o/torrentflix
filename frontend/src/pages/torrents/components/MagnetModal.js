import React from "react";
import { Button, Form, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const MagnetModal = ({ toggle, add }) => {
  let magnetURI = "";

  return (
    <Modal isOpen={true} fade={false} toggle={toggle}>
      <ModalHeader toggle={toggle}>Add from magnet URI</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Input
              onChange={(e) => (magnetURI = e.target.value)}
              placeholder="magnet://..."
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={() => {
            toggle();
            add(magnetURI);
          }}
        >
          Add
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MagnetModal;
