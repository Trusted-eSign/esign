import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { signText } from "../../AC/megafonActions";
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
      console.log("cms", this.props.megafon.cms);
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
}

interface IOwnProps {
  serviceId: string;
}

export default connect((state, ownProps: IOwnProps) => ({
  megafon: state.megafon.toJS(),
  service: state.services.getIn(["entities", ownProps.serviceId]),
}), { signText })(ServiceCertificates);
