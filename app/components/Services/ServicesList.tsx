import React from "react";
import ServicesListItem from "./ServicesListItem";

interface IService {
  type: "MEGAFON";
  name: string;
}

interface IServicesList {
  services: IService[];
}

class ServicesList extends React.PureComponent<IServicesList, {}> {
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
      return <ServicesListItem service={service}/>;
    });

    return body;
  }
}

export default ServicesList;
