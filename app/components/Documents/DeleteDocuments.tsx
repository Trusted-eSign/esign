import PropTypes from "prop-types";
import React from "react";
import { USER_NAME } from "../../constants";
import logger from "../../winstonLogger";

interface IDeleteDocumentsProps {
  onCancel?: () => void;
  removeDocuments: () => void;
}

class DeleteDocuments extends React.Component<IDeleteDocumentsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { removeDocuments } = this.props;
    const { localize, locale } = this.context;

    return (
      <div>
        <div className="row">
          <div className="col s12">
            <span className="card-infos sub">
              {localize("Documents.realy_delete_documents", locale)}
            </span>
          </div>
        </div>
        <div className="col s5 offset-s7">
          <div className="row">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
            </div>
            <div className="col s6">
              <a className="waves-effect waves-light btn modal-close" onClick={removeDocuments}>{localize("Common.delete", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }
}

export default DeleteDocuments;
