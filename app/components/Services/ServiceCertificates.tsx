import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { signText } from "../../AC/megafonActions";
import { addServiceCertificate } from "../../AC/servicesActions";
import { SIGN_TEXT } from "../../service/megafon/constants";
import { MEGAFON } from "../../service/megafon/constants";
import { statusCodes } from "../../service/megafon/statusCodes";
import { mapToArr } from "../../utils";
import BlockNotElements from "../BlockNotElements";
import ProgressBars from "../ProgressBars";
import { IService } from "./types";

interface IMegafonState {
  cms: string;
  error: string;
  isDone: boolean;
  isStarted: boolean;
  status: string;
  transactionId: string;
}

interface IServiceCertificatesProps {
  addServiceCertificate: (certificate: trusted.pki.Certificate, serviceType: "MEGAFON", serviceID: string) => void;
  certificates: object[];
  isStarted: boolean;
  megafon: IMegafonState;
  service: IService | undefined;
  serviceId: string;
  signText: (msisdn: string, text: string, signType: "Attached" | "Detached") => any;
}

class ServiceCertificates extends React.PureComponent<IServiceCertificatesProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidUpdate(prevProps: IServiceCertificatesProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.megafon.isDone !== prevProps.megafon.isDone &&
      this.props.megafon.cms !== prevProps.megafon.cms) {

      const certificate = this.getCertificateFromSign(this.props.megafon.cms);

      if (certificate) {
        this.props.addServiceCertificate(certificate, MEGAFON, this.props.serviceId);
      }

      Materialize.toast("Сервис подключен", 2000, "toast-mep_cms_true");
    }

    if (this.props.megafon.isDone !== prevProps.megafon.isDone &&
      this.props.megafon.status !== prevProps.megafon.status) {
      const status = this.props.megafon.status;
      if (status && status !== "100") {
        const toast = statusCodes[SIGN_TEXT][status] ? statusCodes[SIGN_TEXT][status] : `Ошибка МЭП ${status}`;

        $(".toast-mep_status").remove();
        Materialize.toast(toast, 2000, "toast-mep_status");
      }
    }
  }

  render() {
    const { localize, locale } = this.context;
    const { megafon, service } = this.props;

    const DISABLED = service && !megafon.isStarted ? "" : "disabled";

    return (
      <div className="content-wrapper z-depth-1">
        <nav className="app-bar-content">
          <ul className="app-bar-items">
            <li className="app-bar-item">
              <span>
                {localize("Services.service_certificates", locale)}
              </span>
            </li>
            <li className="right">
              <a className={"nav-small-btn waves-effect waves-light " + DISABLED} >
                <i className="nav-small-icon material-icons cert-settings" onClick={() => this.handleReloadCertificates()}>sync</i>
              </a>
            </li>
          </ul>
        </nav>
        {this.getBody()}
      </div>
    );
  }

  getBody = () => {
    const { localize, locale } = this.context;
    const { certificates, megafon, service } = this.props;

    if (megafon.isStarted) {
      return <ProgressBars />;
    }

    if (certificates && certificates.length) {
      return (
        <div className={"add-cert-collection collection "}>
          {certificates.map((certificate) => {
            let curStatusStyle;
            let curKeyStyle;
            let rectangleStyle;
            if (certificate.status) {
              curStatusStyle = "cert_status_ok long";
              rectangleStyle = { background: "#4caf50" };
            } else {
              curStatusStyle = "cert_status_error long";
              rectangleStyle = { background: "#bf3817" };
            }

            if (certificate.key.length > 0) {
              curKeyStyle = "key long ";
            } else {
              curKeyStyle = "";
            }

            if (curKeyStyle) {
              curKeyStyle += certificate.service === MEGAFON ? "megafonkey" : "localkey";
            }

            return <div className="collection-item avatar certs-collection" key={certificate.id}>
              <div className="r-iconbox-link">
                <div className={"rectangle"} style={rectangleStyle}></div>
                <div className="collection-title pad-cert">{certificate.subjectFriendlyName}</div>
                <div className="collection-info cert-info pad-cert">{certificate.issuerFriendlyName}
                  <div className={curKeyStyle}></div>
                  <div className={curStatusStyle}></div>
                </div>
              </div>
            </div>;
          })}
        </div>);
    } else {
      return <BlockNotElements name="active" title={localize("Certificate.cert_not_found", locale)} />;
    }
  }

  handleReloadCertificates = () => {
    this.handleGetCertificates();
  }

  handleGetCertificates = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { service, signText } = this.props;
    const { localize, locale } = this.context;

    if (service && service.type) {
      if (service.type === MEGAFON) {
        if (service.settings && service.settings.mobileNumber && service.settings.mobileNumber.length === 12) {
          signText(service.settings.mobileNumber, Buffer.from("Подключение сервиса в КриптоАРМ ГОСТ", "utf8").toString("base64"), "Attached")
            .then(
              (response) => Materialize.toast("Запрос успешно отправлен", 2000, "toast-mep_status_true"),
              (error) => {
                $(".toast-mep_status").remove();
                Materialize.toast(statusCodes[SIGN_TEXT][error], 2000, "toast-mep_status");
              },
            );
        } else {
          $(".toast-write_mobile_number").remove();
          Materialize.toast(localize("Services.write_mobile_number", locale), 2000, "toast-write_mobile_number");
        }
      }
    }
  }

  /**
   * Return fist signer certificate
   *
   * @memberof ServiceCertificates
   */
  getCertificateFromSign = (cmsStr: string) => {
    if (!cmsStr || !cmsStr.length) {
      return undefined;
    }

    try {
      const cms: trusted.cms.SignedData = new trusted.cms.SignedData();
      cms.import(Buffer.from("-----BEGIN CMS-----" + "\n" + cmsStr + "\n" + "-----END CMS-----"), trusted.DataFormat.PEM);

      const signers = cms.signers();
      const certificates = cms.certificates();

      let signer: trusted.cms.Signer;
      let signerId: trusted.cms.SignerId;

      for (let i = 0; i < signers.length; i++) {
        signer = signers.items(i);
        signerId = signer.signerId;

        for (let j = 0; j < certificates.length; j++) {
          const tmpCert: trusted.pki.Certificate = certificates.items(j);
          if ((tmpCert.issuerName === signerId.issuerName) && (tmpCert.serialNumber === signerId.serialNumber)) {
            signer.certificate = tmpCert;
            break;
          }
        }

        if (signer.certificate) {
          return signer.certificate;
        }
      }

    } catch (e) {
      //
    }

    return undefined;
  }
}

interface IOwnProps {
  serviceId: string;
}

export default connect((state, ownProps: IOwnProps) => ({
  certificates: mapToArr(state.certificates.entities.filter((certificate) => certificate.serviceId === ownProps.serviceId)),
  megafon: state.megafon.toJS(),
  service: state.services.getIn(["entities", ownProps.serviceId]),
}), { addServiceCertificate, signText })(ServiceCertificates);
