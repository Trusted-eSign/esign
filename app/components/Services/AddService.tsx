import PropTypes from "prop-types";
import React from "react";

interface IAddService {
  onCancel?: () => void;
}

class AddService extends React.Component<IAddService, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IAddService) {
    super(props);
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="add_new_service_modal">
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group" style={{
              boxshadow: "0 0 0 1px rgb(227, 227, 228)",
              height: "250px",
              overflow: "auto",
            }}>
            </div>
          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s3">
            <a className={"waves-effect waves-light btn btn_modal"} onClick={this.handleReset}>{localize("Common.reset", locale)}</a>
          </div>
          <div className="col s6 offset-s3">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleAdd}>{localize("Common.apply", locale)}</a>
            </div>
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleAdd = () => {
    this.handelCancel();
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleReset = () => {
    this.handelCancel();
  }
}

export default AddService;
