import PropTypes from "prop-types";
import React from "react";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import { IService } from "./types";

interface IServiceCertificatesProps {
  service: IService | undefined;
}

class ServiceCertificates extends React.PureComponent<IServiceCertificatesProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;
    const { service } = this.props;

    const disabled = service ? "" : "disabled";

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Services.service_certificates", locale)} />
        <div className={"cert-contents"}>
          <a className={"waves-effect waves-light btn-large add-cert-btn " + disabled} onClick={() => console.log("Получить сертификаты")}>
            {localize("Services.get_sertificates", locale)}
          </a>
        </div>
      </div>
    );
  }
}

export default ServiceCertificates;
