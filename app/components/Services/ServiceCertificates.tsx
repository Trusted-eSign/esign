import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { getCertificates } from "../../AC/cloudCspActions";
import { signText } from "../../AC/megafonActions";
import { addServiceCertificate } from "../../AC/servicesActions";
import { CRYPTOPRO_DSS, USER_NAME } from "../../constants";
import { SIGN_TEXT } from "../../service/megafon/constants";
import { MEGAFON } from "../../service/megafon/constants";
import { statusCodes } from "../../service/megafon/statusCodes";
import { mapToArr } from "../../utils";
import logger from "../../winstonLogger";
import BlockNotElements from "../BlockNotElements";
import AuthWebView from "../CloudCSP/AuthWebView";
import Modal from "../Modal";
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

interface IDSSState {
  certificates: [];
  error: string;
  loaded: boolean;
  loading: boolean;
  statusCode: string;
}

interface IServiceCertificatesProps {
  addServiceCertificate: (certificate: trusted.pki.Certificate, serviceType: "MEGAFON", serviceID: string, certificateId?: string) => void;
  certificates: object[];
  dss: IDSSState;
  isStarted: boolean;
  megafon: IMegafonState;
  service: IService | undefined;
  serviceId: string;
  signText: (msisdn: string, text: string, signType: "Attached" | "Detached") => any;
}

interface IServiceCertificatesState {
  showModalDssAuth: boolean;
}

class ServiceCertificates extends React.PureComponent<IServiceCertificatesProps, IServiceCertificatesState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IServiceCertificatesProps) {
    super(props);

    this.state = {
      showModalDssAuth: false,
    };
  }

  componentDidUpdate(prevProps: IServiceCertificatesProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.megafon.isDone !== prevProps.megafon.isDone &&
      this.props.megafon.cms !== prevProps.megafon.cms) {

      const certificate = this.getCertificateFromSign(this.props.megafon.cms);

      if (certificate) {
        this.props.addServiceCertificate(certificate, MEGAFON, this.props.serviceId);

        logger.log({
          certificate: certificate.subjectName,
          level: "info",
          message: "",
          operation: "Импорт сертификата",
          operationObject: {
            in: "CN=" + certificate.subjectFriendlyName,
            out: "Null",
          },
          userName: USER_NAME,
        });
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

    if (this.props.dss.loaded !== prevProps.dss.loaded &&
      this.props.dss.certificates !== prevProps.dss.certificates) {

      if (this.props.dss.certificates) {
        for (const certificate of this.props.dss.certificates) {
          this.props.addServiceCertificate(certificate.x509, CRYPTOPRO_DSS, this.props.serviceId, certificate.id);

          logger.log({
            certificate: certificate.x509.subjectName,
            level: "info",
            message: "",
            operation: "Импорт сертификата",
            operationObject: {
              in: "CN=" + certificate.x509.subjectFriendlyName,
              out: "Null",
            },
            userName: USER_NAME,
          });
        }

      }

      Materialize.toast("Сервис подключен", 2000, "toast-mep_cms_true");
    }
  }

  render() {
    const { localize, locale } = this.context;
    const { dss, megafon, service } = this.props;

    const DISABLED = service && !megafon.isStarted && !dss.loading ? "" : "disabled";

    return (
      <React.Fragment>
        {/* <nav className="app-bar-content">
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
        </nav> */}
        <div className="content-wrapper z-depth-1">
          {this.getBody()}
        </div>
        {this.showModalAddService()}
      </React.Fragment>
    );
  }

  getBody = () => {
    const { localize, locale } = this.context;
    const { certificates, dss, megafon } = this.props;

    if (megafon.isStarted || dss.loading) {
      return <ProgressBars />;
    }

    if (certificates && certificates.length) {
      return (
        <div className="add-certs">
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
                if (certificate.service) {
                  if (certificate.service === MEGAFON) {
                    curKeyStyle += "megafonkey";
                  } else if (certificate.service === CRYPTOPRO_DSS) {
                    curKeyStyle += "dsskey";
                  }
                } else {
                  curKeyStyle += "localkey";
                }
              }

              return (
                <div className="row certificate-list-item" id={certificate.id}>
                  <div className="collection-item avatar certs-collection" >
                    <div className="r-iconbox-link">
                      <div className={"rectangle"} style={rectangleStyle}></div>
                      <div className="col s11">
                        <div className="collection-title ">{certificate.subjectFriendlyName}</div>
                        <div className="collection-info cert-info ">{certificate.issuerFriendlyName}</div>
                      </div>
                      <div className="col s1">
                        <div className={curKeyStyle}></div>
                        <div className={curStatusStyle}></div>
                      </div>
                    </div>
                  </div>
                </div>);
            })}
          </div>
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

      if (service.type === CRYPTOPRO_DSS) {
        this.handleShowModalDssAuth();
      }
    }
  }

  showModalAddService = () => {
    const { localize, locale } = this.context;
    const { showModalDssAuth } = this.state;

    if (!showModalDssAuth) {
      return;
    }

    return (
      <Modal
        isOpen={showModalDssAuth}
        header={localize("Services.add_new_service", locale)}
        onClose={this.handleCloseModalDssAuth} style={{
          width: "70%",
        }}>

        <div className="cloudCSP_modal">
          <div className="row halftop">
            <div className="col s12">
              <div className="content-wrapper tbody border_group_cloud">
                <AuthWebView onCancel={this.handleCloseModalDssAuth} onTokenGet={this.onTokenGet} auth={this.props.service.settings.authURL} />
              </div>
            </div>
          </div>
          <div className="row halfbottom" />
          <div className="row">
            <div className="col s3 offset-s9">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleCloseModalDssAuth}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  handleShowModalDssAuth = () => {
    this.setState({ showModalDssAuth: true });
  }

  handleCloseModalDssAuth = () => {
    this.setState({ showModalDssAuth: false });
  }

  onTokenGet = (token: string) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { getCertificates, service } = this.props;

    if (!token || !token.length || !service) {
      return;
    }

    getCertificates(service.settings.authURL, service.settings.restURL, token);
    this.handleCloseModalDssAuth();
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
  dss: state.cloudCSP,
  megafon: state.megafon.toJS(),
  service: state.services.getIn(["entities", ownProps.serviceId]),
}), { addServiceCertificate, getCertificates, signText }, null, { withRef: true })(ServiceCertificates);
