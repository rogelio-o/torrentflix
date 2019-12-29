import React from "react";
import { connect } from "react-redux";
import { Input, Modal, ModalBody, ModalHeader } from "reactstrap";

import { openAlert } from "../redux/actions";
import { errorHandling } from "../utils/serviceUtils";
import ItemsList from "./ItemsList";
import Loading from "./Loading";

class ItemCreateModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      items: [],
    };
  }

  _mapItem(item) {
    return this.props.mapItem(item, [
      {
        onClick: () => this.props.add(item.externalReferenceId),
        text: "Add",
        color: "success",
      },
    ]);
  }

  _search(q) {
    this.setState({ loading: true });
    this.props
      .search(q)
      .then((response) => {
        const data = response.data;
        this.setState({
          loading: false,
          items: data.map(this._mapItem.bind(this)),
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false, items: [] }),
        ),
      );
  }

  _onChangeSearch(e) {
    const value = e.target.value;

    if (value.length > 2) {
      this._search(value);
    }
  }

  render() {
    const { toggle } = this.props;
    const { loading, items } = this.state;

    return (
      <Modal isOpen={true} fade={false} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>
          <Input onChange={this._onChangeSearch.bind(this)} />
        </ModalHeader>
        <ModalBody>
          {loading ? <Loading /> : <ItemsList items={items} />}
        </ModalBody>
      </Modal>
    );
  }
}

export default connect(null, { openAlert })(ItemCreateModal);
