import PropTypes from "prop-types";
import React from "react";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";

class ServiceSettings extends React.PureComponent<{}, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Services.service_settings", locale)} />
      </div>
    );
  }
}

export default ServiceSettings;
