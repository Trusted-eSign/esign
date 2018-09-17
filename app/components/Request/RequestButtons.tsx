import PropTypes from "prop-types";
import React from "react";

interface IRequestButtonsProps {
  onCopy: () => void;
}

class RequestButtons extends React.Component<IRequestButtonsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;

    return (
      <div className={"btns-for-operation active"}>
        <a className="waves-effect waves-light btn-large operation-btn active" onClick={this.props.onCopy}>
          {localize("Common.copy", locale)}
        </a>
      </div>
    );

  }
}

export default RequestButtons;
