import React from "react";
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
      <div className="row" onClick={() => this.props.onClick(service)}>
        <div className={"collection-item avatar certs-collection " + activeType} >
          <div className="col s2">
            <ServiceIcon type={service.type} />
          </div>
          <div className="col s10">
            <div className="collection-title">{service.name}</div>
            <div className="collection-info">{service.name}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default ServicesListItem;
