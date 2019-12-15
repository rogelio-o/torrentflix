import React from "react";
import { Form, FormGroup, Input } from "reactstrap";

const SearchForm = ({ onChangeSearch }) => {
  return (
    <Form inline>
      <FormGroup className="mr-sm-2">
        <Input type="text" onChange={onChangeSearch} />
      </FormGroup>
    </Form>
  );
};

export default SearchForm;
