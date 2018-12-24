import PropTypes from "prop-types";
import React from "react";
import { MEGAFON } from "../../service/megafon/constants";
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
        return "МЭП Мегафон";

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

      default:
        return null;
    }
  }
}
