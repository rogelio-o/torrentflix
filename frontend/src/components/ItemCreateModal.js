import axios from "axios";
import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

import ItemsList from "./ItemsList";
import Loading from "./Loading";

class ItemCreateModal extends React.Component {
  _source = axios.CancelToken.source();

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      items: [],
    };
  }

  _cancelRequest() {
    this._source.cancel();
    this._source = axios.CancelToken.source();
  }

  _mapItem(item) {
    console.log(this.props.mapItem);
    console.log(
      this.props.mapItem(item, [
        {
          onClick: () => this.props.add(item.externalReferenceId),
          text: "Add",
          color: "success",
        },
      ]),
    );
    return this.props.mapItem(item, [
      {
        onClick: () => this.props.add(item.externalReferenceId),
        text: "Add",
        color: "success",
      },
    ]);
  }

  _search(q) {
    this._cancelRequest();

    this.setState({ loading: true });
    axios
      .get(this.props.searchPath, {
        cancelToken: this._source.token,
        params: {
          q,
        },
      })
      .then((response) => {
        const data = response.data;
        this.setState({
          loading: false,
          items: data.map(this._mapItem.bind(this)),
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loading: false, items: [] });
        }
      });
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
          <input onChange={this._onChangeSearch.bind(this)} />
        </ModalHeader>
        <ModalBody>
          {loading ? <Loading /> : <ItemsList items={items} />}
        </ModalBody>
      </Modal>
    );
  }
}

export default ItemCreateModal;
