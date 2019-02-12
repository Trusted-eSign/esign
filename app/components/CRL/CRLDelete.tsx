import PropTypes from "prop-types";
import React from "react";
import { USER_NAME } from "../../constants";
import logger from "../../winstonLogger";

interface ICRLDeleteProps {
  crl: any;
  onCancel?: () => void;
  reloadCertificates: () => void;
}

class CRLDelete extends React.Component<ICRLDeleteProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col s12">
            <span className="card-infos sub">
              {localize("CRL.realy_delete_crl", locale)}
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col s5 offset-s7">
            <div className="row nobottom">
              <div className="col s6">
                <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelCancel}>
                  {localize("Common.cancel", locale)}
                </a>
              </div>
              <div className="col s6">
                <a className="waves-effect waves-light btn modal-close" onClick={this.handleDeleteCrl}>
                  {localize("Common.delete", locale)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleDeleteCrl = () => {
    const { crl, reloadCertificates } = this.props;
    const { localize, locale } = this.context;

    if (!crl) {
      return;
    }

    if (!window.PKISTORE.deleteCrl(crl)) {
      $(".toast-crl_delete_failed").remove();
      Materialize.toast(localize("CRL.crl_delete_failed", locale), 2000, "toast-crl_delete_failed");

      return;
    }

    reloadCertificates();

    $(".toast-crl_delete_ok").remove();
    Materialize.toast(localize("CRL.crl_delete_ok", locale), 2000, "toast-crl_delete_ok");
  }
}

export default CRLDelete;
