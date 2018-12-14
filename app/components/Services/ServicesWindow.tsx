import PropTypes from "prop-types";
import React from "react";

class ServicesWindow extends React.PureComponent<{}, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="main">
      </div>
    );
  }
}

export default ServicesWindow;
