import PropTypes from "prop-types";
import React from "react";

class DocumentsWindow extends React.Component<{}, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    return (
      <div className="row">
      </div>
    );
  }
}

export default DocumentsWindow;
