import React from "react";
import { connect } from "react-redux";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

import { closeAlert } from "../../redux/actions";
import { getAlertState } from "../../redux/selectors";

const Alert = ({ alert, closeAlert }) => {
  return (
    <Modal isOpen={alert.open} fade={true} toggle={closeAlert}>
      <ModalHeader toggle={closeAlert}>{alert.title}</ModalHeader>
      <ModalBody>{alert.description}</ModalBody>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const alert = getAlertState(state);

  return { alert };
};

export default connect(mapStateToProps, { closeAlert })(Alert);
