import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";

class ContainerListItem extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.isOpen !== this.props.isOpen;
  }

  handleClick = () => {
    const { activeContainer } = this.props;

    activeContainer();
  }

  render() {
    const { container, toggleOpen, isOpen } = this.props;
    let active = "";

    if (isOpen) {
      active = "active";
    }

    return (
      <div>
        <div className="row certificate-list-item" onClick={this.handleClick}>
          <div className={"collection-item avatar certs-collection " + active}>
            <div className="col s12">
              <div className="collection-title">{container.reader}</div>
              <div className="collection-info cert-info ">{container.friendlyName}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContainerListItem;
