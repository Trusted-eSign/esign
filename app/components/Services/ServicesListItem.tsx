import React from "react";
import ServiceIcon from "./ServiceIcon";

interface IService {
  type: "MEGAFON";
  name: string;
}

interface IServicesListItemProps {
  service: IService;
}

class ServicesListItem extends React.PureComponent<IServicesListItemProps, {}> {
  render() {
    const { service } = this.props;

    return (
      <div className="row">
        <div className="collection-item avatar certs-collection">
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
