import PropTypes from "prop-types";
import React from "react";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";

class ServiceCertificates extends React.PureComponent<{}, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Services.service_certificates", locale)} />
      </div>
    );
  }
}

export default ServiceCertificates;
