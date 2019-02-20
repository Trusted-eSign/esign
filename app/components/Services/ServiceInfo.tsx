import PropTypes from "prop-types";
import React from "react";
import { CRYPTOPRO_DSS, CRYPTOPRO_DSS_NAME, CRYPTOPRO_SVS, CRYPTOPRO_SVS_NAME } from "../../constants";
import { MEGAFON, MEGAFON_NAME } from "../../service/megafon/constants";
import { IService } from "./types";

interface IServiceInfoProps {
  service: IService;
}

export default class ServiceInfo extends React.Component<IServiceInfoProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;
    const { service } = this.props;

    return (
      <div className="add-cert-collection collection cert-info-list">
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-info cert-info-blue"}>{localize("Services.service_type", locale)}</div>
          <div className={"collection-title selectable-text"}>{this.getServiceType(service.type)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-info cert-info-blue"}>{localize("Services.description", locale)}</div>
          <div className={"collection-title selectable-text"}>{service.name}</div>
        </div>
        {this.getServiceSettings(service)}
      </div>
    );
  }

  getServiceType = (type: string) => {
    switch (type) {
      case MEGAFON:
        return MEGAFON_NAME;

      case CRYPTOPRO_DSS:
        return CRYPTOPRO_DSS_NAME;

      case CRYPTOPRO_SVS:
        return CRYPTOPRO_SVS_NAME;

      default:
        return type;
    }
  }

  getServiceSettings = (service: IService) => {
    const { localize, locale } = this.context;

    switch (service.type) {
      case MEGAFON:
        return (
          <div className="collection-item certs-collection certificate-info">
            <div className={"collection-info cert-info-blue"}>{localize("Services.mobile_number", locale)}</div>
            <div className={"collection-title selectable-text"}>{service.settings.mobileNumber}</div>
          </div>
        );

      case CRYPTOPRO_DSS:
        return (
          <React.Fragment>
            <div className="collection-item certs-collection certificate-info">
              <div className={"collection-info cert-info-blue"}>{localize("CloudCSP.auth", locale)}</div>
              <div className={"collection-title selectable-text"}>{service.settings.authURL}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
              <div className={"collection-info cert-info-blue"}>{localize("CloudCSP.rest", locale)}</div>
              <div className={"collection-title selectable-text"}>{service.settings.restURL}</div>
            </div>
          </React.Fragment>
        );

      case CRYPTOPRO_SVS:
        return (
          <React.Fragment>
            <div className="collection-item certs-collection certificate-info">
              <div className={"collection-info cert-info-blue"}>{localize("SVS.hostname", locale)}</div>
              <div className={"collection-title selectable-text"}>{service.settings.hostName}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
              <div className={"collection-info cert-info-blue"}>{localize("SVS.application_name", locale)}</div>
              <div className={"collection-title selectable-text"}>{service.settings.applicationName}</div>
            </div>
          </React.Fragment>
        );

      default:
        return null;
    }
  }
}
