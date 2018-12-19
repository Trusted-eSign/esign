import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { signText } from "../../AC/megafonActions";
import { addServiceCertificate } from "../../AC/servicesActions";
import { MEGAFON } from "../../service/megafon/constants";
import { SIGN_TEXT } from "../../service/megafon/constants";
import { statusCodes } from "../../service/megafon/statusCodes";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
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
    const { service } = this.props;

    const disabled = service ? "" : "disabled";

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Services.service_certificates", locale)} />
        <div className={"cert-contents"}>
          <a className={"waves-effect waves-light btn-large add-cert-btn " + disabled} onClick={this.handleGetCertificates}>
            {localize("Services.get_sertificates", locale)}
          </a>
        </div>
      </div>
    );
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
  megafon: state.megafon.toJS(),
  service: state.services.getIn(["entities", ownProps.serviceId]),
}), { signText })(ServiceCertificates);
