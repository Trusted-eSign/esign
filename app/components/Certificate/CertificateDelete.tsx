import PropTypes from "prop-types";
import React from "react";
import { USER_NAME } from "../../constants";
import logger from "../../winstonLogger";

interface ICertificateDeleteProps {
  certificate: any;
  onCancel?: () => void;
  reloadCertificates: () => void;
  reloadContainers: () => void;
}

interface ICertificateDeleteState {
  container: string;
  deleteContainer: boolean;
}

class CertificateDelete extends React.Component<ICertificateDeleteProps, ICertificateDeleteState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ICertificateDeleteProps) {
    super(props);

    this.state = ({
      container: "",
      deleteContainer: false,
    });
  }

  componentDidMount() {
    const { certificate } = this.props;

    if (certificate) {
      const container = this.getContainerByCertificate(certificate);
      this.setState({ container });
    }
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { container, deleteContainer } = this.state;
    const { localize, locale } = this.context;

    const body = container ?
      (
        <div className="input-field col s12">
          <input
            name="groupDelCont"
            type="checkbox"
            id="delCont"
            className="checkbox-red"
            checked={deleteContainer}
            onClick={this.toggleDeleteContainer}
          />
          <label htmlFor="delCont">{localize("Containers.delete_container", locale)}</label>
        </div>
      ) :
      (
        <div className="col s12">
          <span className="card-infos sub">
            {localize("Certificate.realy_delete_certificate", locale)}
          </span>
        </div>
      );

    return (
      <React.Fragment>
        <div className="row">
          {body}
        </div>
        <div className="row">
          <div className="col s5 offset-s7">
            <div className="row nobottom">
              <div className="col s6">
                <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
              </div>
              <div className="col s6">
                <a className="waves-effect waves-light btn modal-close" onClick={this.handleDeleteCertificateAndContainer}>{localize("Common.delete", locale)}</a>
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

  toggleDeleteContainer = () => {
    this.setState({ deleteContainer: !this.state.deleteContainer });
  }

  handleDeleteCertificateAndContainer = () => {
    const { certificate, reloadCertificates, reloadContainers } = this.props;
    const { container, deleteContainer } = this.state;
    const { localize, locale } = this.context;

    if (!certificate) {
      return;
    }

    if (container && deleteContainer) {
      try {
        trusted.utils.Csp.deleteContainer(container, 75);

        $(".toast-container_delete_ok").remove();
        Materialize.toast(localize("Containers.container_delete_ok", locale), 2000, "toast-container_delete_ok");

        logger.log({
          certificate: "",
          level: "info",
          message: "",
          operation: "Удаление контейнера",
          operationObject: {
            in: container,
            out: "Null",
          },
          userName: USER_NAME,
        });

        reloadContainers();
      } catch (err) {
        $(".toast-container_delete_failed").remove();
        Materialize.toast(localize("Containers.container_delete_failed", locale), 2000, "toast-container_delete_failed");

        logger.log({
          certificate: "",
          level: "error",
          message: err.message ? err.message : err,
          operation: "Удаление контейнера",
          operationObject: {
            in: container,
            out: "Null",
          },
          userName: USER_NAME,
        });
      }
    }

    if (!window.PKISTORE.deleteCertificate(certificate)) {
      $(".toast-cert_delete_failed").remove();
      Materialize.toast(localize("Certificate.cert_delete_failed", locale), 2000, "toast-cert_delete_failed");

      return;
    }

    reloadCertificates();

    $(".toast-cert_delete_ok").remove();
    Materialize.toast(localize("Certificate.cert_delete_ok", locale), 2000, "toast-cert_delete_ok");
  }

  getContainerByCertificate = (certificate: any) => {
    let container = "";

    if (certificate.category === "MY" && certificate.key) {
      try {
        const x509 = window.PKISTORE.getPkiObject(certificate);
        container = trusted.utils.Csp.getContainerNameByCertificate(x509);
      } catch (e) {
        // console.log("error get container by certificate", e);
      }
    }

    return container;
  }
}

export default CertificateDelete;
