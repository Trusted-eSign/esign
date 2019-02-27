import React from "react";
import { CRYPTOPRO_DSS, CRYPTOPRO_DSS_NAME, CRYPTOPRO_SVS, CRYPTOPRO_SVS_NAME } from "../../constants";
import { MEGAFON, MEGAFON_NAME } from "../../service/megafon/constants";
import ServiceIcon from "./ServiceIcon";
import { IService } from "./types";

interface IServicesListItemProps {
  active: boolean;
  onClick: (service: IService) => void;
  service: IService;
}

class ServicesListItem extends React.PureComponent<IServicesListItemProps, {}> {
  render() {
    const { active, service } = this.props;

    const activeType = active ? "active" : "";

    return (
      <div className="row nobottom" onClick={() => this.props.onClick(service)}>
        <div className={"collection-item avatar certs-collection " + activeType} >
          <div className="col s2">
            <ServiceIcon type={service.type} />
          </div>
          <div className="col s10">
            <div className="collection-title">{this.getTitle(service)}</div>
            <div className="collection-info">{this.getInfo(service)}</div>
          </div>
        </div>
      </div>
    );
  }

  getTitle = (service: IService) => {
    switch (service.type) {
      case MEGAFON:
        return service.name ? service.name : MEGAFON_NAME;

      case CRYPTOPRO_DSS:
        return service.name ? service.name : CRYPTOPRO_DSS_NAME;

      case CRYPTOPRO_SVS:
        return service.name ? service.name : CRYPTOPRO_SVS_NAME;

      default:
        return service.type;
    }
  }

  getInfo = (service: IService) => {
    switch (service.type) {
      case MEGAFON:
        return service.settings ? service.settings.mobileNumber : "";

      case CRYPTOPRO_DSS:
        return service.settings ? service.settings.authURL : "";

      case CRYPTOPRO_SVS:
        return service.settings ? service.settings.hostName : "";

      default:
        return service.type;
    }
  }
}

export default ServicesListItem;
