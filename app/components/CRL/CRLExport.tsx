import * as fs from "fs";
import PropTypes from "prop-types";
import React from "react";
import { BASE64 } from "../../constants";
import { fileExists } from "../../utils";
import EncodingTypeSelector from "../EncodingTypeSelector";

interface ICRLExportState {
  encodingType: string;
}

interface ICRLExportProps {
  crl: any;
  onSuccess?: () => void;
  onFail?: () => void;
  onCancel?: () => void;
}

const DIALOG = window.electron.remote.dialog;

class CRLExport extends React.Component<ICRLExportProps, ICRLExportState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ICRLExportProps) {
    super(props);

    this.state = ({
      encodingType: BASE64,
    });
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div >
        <div className="row">
          <div className="col s12">
            <span className="card-infos sub">
              <div className="row" />
              {this.getMessage()}
            </span>
          </div>
        </div>
        {this.getBody()}
        <div className="row">
          <div className="col s2 offset-s6">
            <a className={"waves-effect waves-light btn modal-close "} onClick={this.handleExport}>{localize("Export.export", locale)}</a>
          </div>
          <div className="col s3  offset-s1">
            <a className={"waves-effect waves-light btn modal-close "} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
          </div>
        </div>
      </div>
    );
  }

  getMessage = (): string => {
    const { encodingType } = this.state;
    const { localize, locale } = this.context;

    return localize("Export.export_format", locale) + ": "
      + (encodingType === BASE64 ? localize("Export.export_crl_format_base64", locale) : localize("Export.export_crl_format_der", locale));
  }

  getBody = () => {
    const { encodingType } = this.state;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col s6 card-infos sub">
            <EncodingTypeSelector EncodingValue={encodingType} handleChange={(encoding: string) => this.handleEncodingChange(encoding)} />
          </div>
        </div>
      </React.Fragment>
    );
  }

  handleEncodingChange = (encoding: string) => {
    this.setState({ encodingType: encoding });
  }

  handleExport = () => {
    const { encodingType } = this.state;
    const { crl, onCancel, onFail, onSuccess } = this.props;
    const { localize, locale } = this.context;

    const extension = "crl";

    const outFilePAth = DIALOG.showSaveDialog({
      defaultPath: "export." + extension,
      filters: [{ name: localize("CRL.crls", locale), extensions: [extension] }],
      title: localize("CRL.export_crl", locale),
    });

    const X509_CRL = window.PKISTORE.getPkiObject(crl);

    if (outFilePAth && X509_CRL) {
      try {
        const encoding = encodingType === BASE64 ? trusted.DataFormat.PEM : trusted.DataFormat.DER;
        X509_CRL.save(outFilePAth, encoding);
      } catch (e) {
        $(".toast-crl_export_failed").remove();
        Materialize.toast(localize("CRL.crl_export_failed", locale), 2000, "toast-crl_export_failed");

        if (fileExists(outFilePAth)) {
          fs.unlinkSync(outFilePAth);
        }

        if (onFail) {
          onFail();
        }

        return;
      }

      if (onSuccess) {
        onSuccess();
      }

      $(".toast-crl_export_ok").remove();
      Materialize.toast(localize("CRL.crl_export_ok", locale), 2000, "toast-crl_export_ok");
    } else {
      if (onCancel) {
        onCancel();
      }

      $(".toast-crl_export_cancel").remove();
      Materialize.toast(localize("CRL.crl_export_cancel", locale), 2000, "toast-crl_export_cancel");
    }
  }

  handelCancel = () => {
    const { onCancel } = this.props;
    const { localize, locale } = this.context;

    if (onCancel) {
      onCancel();
    }

    $(".toast-crl_export_cancel").remove();
    Materialize.toast(localize("CRL.crl_export_cancel", locale), 2000, "toast-crl_export_cancel");
  }
}

export default CRLExport;
