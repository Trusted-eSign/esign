import React from "react";
import ServicesListItem from "./ServicesListItem";
import { IService } from "./types";

interface IServicesListProps {
  activeService?: IService;
  onListItemClick: (service: IService) => (service: IService) => void;
  services: IService[];
}

class ServicesList extends React.PureComponent<IServicesListProps, {}> {
  constructor(props: IServicesListProps) {
    super(props);
  }

  render() {
    const { services } = this.props;

    if (!services || !services.length) {
      return null;
    }

    return (
      <div className="collection">
        {this.getBody(services)}
      </div>
    );
  }

  getBody = (services: IService[]) => {
    const body = services.map((service) => {
      return <ServicesListItem
        key={service.id}
        active={this.isItemOpened(service.id)}
        onClick={this.props.onListItemClick(service)}
        service={service}
      />;
    });

    return body;
  }

  isItemOpened = (id: string) => {
    return this.props.activeService ? this.props.activeService.id === id : false;
  }
}

export default ServicesList;
