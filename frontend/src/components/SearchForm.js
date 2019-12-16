import React from "react";
import { Form, FormGroup, Input } from "reactstrap";

const SearchForm = ({ value, onChangeSearch }) => {
  return (
    <Form inline>
      <FormGroup className="mr-sm-2">
        <Input type="text" value={value} onChange={onChangeSearch} />
      </FormGroup>
    </Form>
  );
};

export default SearchForm;
