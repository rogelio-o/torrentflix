import "./ItemCreateModal.css";

import React from "react";
import { connect } from "react-redux";
import { Input, Modal, ModalBody, ModalHeader } from "reactstrap";

import { openAlert } from "../redux/actions";
import { errorHandling } from "../utils/serviceUtils";
import BaseItem from "./BaseItem";
import BaseItemsList from "./BaseItemsList";
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
    const result = this.props.mapItem(item, []);
    result.externalReferenceId = item.externalReferenceId;

    return result;
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
      <Modal isOpen={true} fade={false} toggle={toggle} size="xl">
        <ModalHeader className="modal-header-input" toggle={toggle}>
          <Input
            placeholder="Search..."
            onChange={this._onChangeSearch.bind(this)}
            id="search-input"
          />
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <Loading />
          ) : (
            <BaseItemsList
              items={items}
              itemRenderer={(item) => (
                <BaseItem
                  item={item}
                  dataRenderer={(children) => (
                    <div
                      className="item-data item-data-btn"
                      onClick={() => this.props.add(item.externalReferenceId)}
                    >
                      {children}
                    </div>
                  )}
                />
              )}
            />
          )}
        </ModalBody>
      </Modal>
    );
  }
}

export default connect(null, { openAlert })(ItemCreateModal);
