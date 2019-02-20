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
import DeleteService from "./DeleteService";
import ModifyService from "./ModifyService";
import ServiceCertificates from "./ServiceCertificates";
import ServiceInfo from "./ServiceInfo";
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
  showModalChangeService: boolean;
  showModalDeleteService: boolean;
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
      showModalChangeService: false,
      showModalDeleteService: false,
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

  componentDidMount() {
    $(".nav-small-btn, .file-setting-item").dropdown({
      alignment: "left",
      belowOrigin: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });

    $(".collapsible").collapsible();
  }

  render() {
    const { localize, locale } = this.context;
    const { services } = this.props;
    const { activeService } = this.state;

    const service = activeService ? this.props.mapServices.getIn(["entities", activeService.id]) : undefined;
    const DISABLED = service ? "" : "disabled";

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

          <div className="content-item-height" style={{ paddingLeft: "0" }}>
            <nav className="app-bar-content">
              <ul className="app-bar-items">
                <li className="app-bar-item">
                  <span>
                    {localize("Services.service_settings", locale)}
                  </span>
                </li>
                <li className="right">
                  <a className={"nav-small-btn waves-effect waves-light " + DISABLED} data-activates="dropdown-btn-for-service">
                    <i className="nav-small-icon material-icons cert-settings">more_vert</i>
                  </a>
                  <ul id="dropdown-btn-for-service" className="dropdown-content">
                    <li><a onClick={() => this.handleShowModalChangeService()}>{localize("Services.change", locale)}</a></li>
                    <li><a onClick={() => this.handleShowModalDeleteService()}>{localize("Services.delete", locale)}</a></li>
                  </ul>
                </li>
              </ul>
            </nav>
            <div className="add-certs">
              <ul className="collapsible" data-collapsible="accordion">
                <li>
                  <div className="collapsible-header color active">
                    <i className="material-icons left token" />
                    {localize("Services.info", locale)}
                  </div>
                  <div className="collapsible-body">
                    <div className="content-wrapper z-depth-1">
                      <div className="add-certs">
                        {service ?
                          <ServiceInfo service={service.toJS()} /> :
                          <BlockNotElements name="active" title={localize("Services.service_not_selected", locale)} />
                        }
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="collapsible-header color">
                    <i className="material-icons left my" />
                    {localize("Services.service_certificates", locale)}
                  </div>
                  <div className="collapsible-body">
                    <ServiceCertificates serviceId={activeService ? activeService.id : undefined} />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {this.showModalAddService()}
        {this.showModalDeleteService()}
        {this.showModalChangeService()}
      </div >
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

        <AddService onCancel={this.handleOnCancelAddService} />
      </Modal>
    );
  }

  showModalDeleteService = () => {
    const { localize, locale } = this.context;
    const { showModalDeleteService } = this.state;
    const { activeService } = this.state;

    const service = activeService ? this.props.mapServices.getIn(["entities", activeService.id]) : undefined;

    if (!service || !showModalDeleteService) {
      return;
    }

    return (
      <Modal
        isOpen={showModalDeleteService}
        header={localize("Services.delete_service", locale)}
        onClose={this.handleCloseModalDeleteService}>

        <DeleteService
          service={service ? service.toJS() : undefined}
          onCancel={this.handleCloseModalDeleteService} />
      </Modal>
    );
  }

  showModalChangeService = () => {
    const { localize, locale } = this.context;
    const { showModalChangeService } = this.state;
    const { activeService } = this.state;

    const service = activeService ? this.props.mapServices.getIn(["entities", activeService.id]) : undefined;

    if (!service || !showModalChangeService) {
      return;
    }

    return (
      <Modal
        isOpen={showModalChangeService}
        header={localize("Services.service_settings", locale)}
        onClose={this.handleCloseModalChangeService}
        style={{
          width: "70%",
        }}>

        <ModifyService
          service={service ? service.toJS() : undefined}
          onCancel={this.handleCloseModalChangeService} />
      </Modal>
    );
  }

  handleShowModalChangeService = () => {
    this.setState({ showModalChangeService: true });
  }

  handleCloseModalChangeService = () => {
    this.setState({ showModalChangeService: false });
  }

  handleShowModalDeleteService = () => {
    this.setState({ showModalDeleteService: true });
  }

  handleCloseModalDeleteService = () => {
    this.setState({ showModalDeleteService: false });
  }

  handleOnCancelAddService = (service: IService) => {
    if (service) {
      this.setState({
        activeService: service,
      });
    }

    this.handleCloseModalAddService();
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
