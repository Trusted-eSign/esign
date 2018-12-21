import fs from "fs";
import { Map } from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { SERVICES_JSON } from "../../constants";
import { mapToArr } from "../../utils";
import BlockNotElements from "../BlockNotElements";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import Modal from "../Modal";
import AddService from "./AddService";
import ServiceCertificates from "./ServiceCertificates";
import ServiceSettings from "./ServiceSettings";
import ServicesList from "./ServicesList";
import { IService } from "./types";

interface IServicesWindowProps {
  certificates: any[];
  mapServices: Map<any, any>;
  services: IService[];
}

interface IServicesWindowState {
  activeService: IService | undefined;
  showModalAddService: boolean;
}

class ServicesWindow extends React.PureComponent<IServicesWindowProps, IServicesWindowState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IServicesWindowProps) {
    super(props);

    this.state = {
      activeService: undefined,
      showModalAddService: false,
    };
  }

  componentWillUnmount() {
    const state = {
      certificates: this.props.certificates,
      services: this.props.services,
    };

    const sstate = JSON.stringify(state, null, 4);

    fs.writeFile(SERVICES_JSON, sstate, (err: any) => {
      if (err) {
        // tslint:disable-next-line:no-console
        console.log("-------");
      }
      // tslint:disable-next-line:no-console
      console.log("++++++");
    });
  }

  render() {
    const { localize, locale } = this.context;
    const { services } = this.props;
    const { activeService } = this.state;

    return (
      <div className="main">
        <div className="content">
          <div className="content-item-height">
            <div style={{ height: "90%" }} >
              <div className="content-wrapper z-depth-1">
                <HeaderWorkspaceBlock text={localize("Services.services_list", locale)} />
                {services && services.length ?
                  (
                    <div className="add" style={{ overflow: "auto" }}>
                      <ServicesList
                        activeService={activeService}
                        onListItemClick={this.toggleActiveService}
                        services={services}
                      />
                    </div>
                  ) :
                  (
                    <BlockNotElements name="active" title={localize("Services.empty_services_list", locale)} />
                  )}
              </div>

              <div className={"btns-for-operation active"}>
                <a className="waves-effect waves-light btn-large operation-btn active" onClick={this.handleShowModalAddService}>
                  {localize("Services.add", locale)}
                </a>
              </div>
            </div>
          </div>

          <div className="content-tem">
            <div style={{
              height: "50%",
              paddingRight: "0.75rem",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              position: "relative",
            }}>
              <ServiceSettings service={activeService ? this.props.mapServices.getIn(["entities", activeService.id]) : undefined} />
            </div>
            <div style={{
              height: "50%",
              paddingRight: "0.75rem",
              paddingBottom: "0.75rem",
              position: "relative",
            }}>
              <ServiceCertificates serviceId={activeService ? activeService.id : undefined} />
            </div>
          </div>
          {this.showModalAddService()}
        </div>
      </div>
    );
  }

  toggleActiveService = (service: IService) => (ev: any) => {
    const { activeService } = this.state;

    if (ev && ev.preventDefault) {
      ev.preventDefault();
    }

    if (service) {
      this.setState({
        activeService: activeService && activeService.id && activeService.id === service.id ? undefined : service,
      });
    }
  }

  showModalAddService = () => {
    const { localize, locale } = this.context;
    const { showModalAddService } = this.state;

    if (!showModalAddService) {
      return;
    }

    return (
      <Modal
        isOpen={showModalAddService}
        header={localize("Services.add_new_service", locale)}
        onClose={this.handleCloseModalAddService} style={{
          width: "70%",
        }}>

        <AddService onCancel={this.handleCloseModalAddService} />
      </Modal>
    );
  }

  handleShowModalAddService = () => {
    this.setState({ showModalAddService: true });
  }

  handleCloseModalAddService = () => {
    this.setState({ showModalAddService: false });
  }
}

export default connect((state) => ({
  certificates: mapToArr(state.certificates.entities.filter((certificate) => certificate.service && certificate.serviceId)),
  mapServices: state.services,
  services: mapToArr(state.services.entities),
}))(ServicesWindow);
