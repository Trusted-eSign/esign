import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { signText } from "../../AC/megafonActions";
import { addServiceCertificate } from "../../AC/servicesActions";
import { SIGN_TEXT } from "../../service/megafon/constants";
import { MEGAFON } from "../../service/megafon/constants";
import { statusCodes } from "../../service/megafon/statusCodes";
import { mapToArr } from "../../utils";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
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
        this.props.addServiceCertificate(certificate, MEGAFON, "1");
      }

      Materialize.toast("Сервис подключен", 2000, "toast-mep_cms_true");
    }
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Services.service_certificates", locale)} />
        {this.getBody()}
      </div>
    );
  }

  getBody = () => {
    const { localize, locale } = this.context;
    const { certificates, isStarted, service } = this.props;

    if (isStarted) {
      return <ProgressBars />;
    }

    const disabled = service ? "" : "disabled";

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
              curKeyStyle = "key long";
            } else {
              curKeyStyle = "";
            }

            return <div className="collection-item avatar certs-collection" key={certificate.id}>
              <div className="r-iconbox-link">
                <div className={"rectangle"} style={rectangleStyle}></div>
                <div className="collection-title pad-cert">{certificate.subjectFriendlyName}</div>
                <div className="collection-info cert-info pad-cert">{certificate.issuerFriendlyName}
                  <div className="key long"></div>
                  <div className={curStatusStyle}></div>
                </div>
              </div>
            </div>;
          })}
        </div>);
    } else {
      return (
        <div className={"cert-contents"}>
          <a className={"waves-effect waves-light btn-large add-cert-btn " + disabled} onClick={this.handleGetCertificates}>
            {localize("Services.get_sertificates", locale)}
          </a>
        </div>
      );
    }
  }

  handleGetCertificates = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { service, signText } = this.props;

    if (service && service.type) {
      if (service.type === MEGAFON && service.settings && service.settings.mobileNumber) {
        signText(service.settings.mobileNumber, Buffer.from("TEST: CryptoARM GOST", "utf8").toString("base64"), "Attached")
          .then(
            (response) => Materialize.toast("Запрос успешно отправлен", 2000, "toast-mep_status_true"),
            (error) => Materialize.toast(statusCodes[SIGN_TEXT][error], 2000, "toast-mep_status"),
          );
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
  isStarted: state.megafon.isStarted,
  megafon: state.megafon.toJS(),
  service: state.services.getIn(["entities", ownProps.serviceId]),
}), { addServiceCertificate, signText })(ServiceCertificates);
