import PropTypes from "prop-types";
import React from "react";
import { USER_NAME } from "../../constants";
import logger from "../../winstonLogger";

interface IDeleteDocumentsProps {
  removeDocuments: () => void;
}

class DeleteDocuments extends React.Component<IDeleteDocumentsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

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
        <div className="row">
          <div className="col s1 offset-s9">
            <a className="waves-effect waves-light btn modal-close" onClick={removeDocuments}>{localize("Common.delete", locale)}</a>
          </div>
        </div>
      </div>
    );
  }
}

export default DeleteDocuments;
