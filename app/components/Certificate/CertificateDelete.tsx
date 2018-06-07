import PropTypes from "prop-types";
import React from "react";

interface ICertificateDeleteProps {
  certificate: any;
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
      <div>
        <div className="row">
          {body}
        </div>
        <div className="row">
          <div className="col s1 offset-s9">
            <a className="waves-effect waves-light btn modal-close" onClick={this.handleDeleteCertificateAndContainer}>{localize("Common.delete", locale)}</a>
          </div>
        </div>
      </div>
    );
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

        reloadContainers();
      } catch (e) {
        $(".toast-container_delete_failed").remove();
        Materialize.toast(localize("Containers.container_delete_failed", locale), 2000, "toast-container_delete_failed");
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
