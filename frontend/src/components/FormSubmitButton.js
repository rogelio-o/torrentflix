import React from "react";
import { Col, FormGroup } from "reactstrap";
import Button from "reactstrap-button-loader";

const FormSubmitButton = ({ loading, handleSubmit, children }) => {
  return (
    <FormGroup row>
      <Col sm={{ size: 10, offset: 2 }}>
        <Button loading={loading} onClick={handleSubmit}>
          {children}
        </Button>
      </Col>
    </FormGroup>
  );
};

export default FormSubmitButton;
