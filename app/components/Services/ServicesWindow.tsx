import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { MEGAFON } from "../../service/megafon/constants";
import { mapToArr } from "../../utils";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import Modal from "../Modal";
import AddService from "./AddService";
import ServiceCertificates from "./ServiceCertificates";
import ServiceSettings from "./ServiceSettings";
import ServicesList from "./ServicesList";
import { IService } from "./types";

interface IServicesWindowProps {
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

  constructor(props: {}) {
    super(props);

    this.state = {
      activeService: undefined,
      showModalAddService: false,
    };
  }

  render() {
    const { localize, locale } = this.context;
    const { services } = this.props;

    return (
      <div className="main">
        <div className="content">
          <div className="content-item-height">
            <div style={{ height: "90%" }} >
              <div className="content-wrapper z-depth-1">
                <HeaderWorkspaceBlock text={localize("Services.services_list", locale)} />
                <ServicesList
                  activeService={this.state.activeService}
                  onListItemClick={this.toggleActiveService}
                  services={services}
                />
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
              <ServiceSettings service={this.state.activeService} />
            </div>
            <div style={{
              height: "50%",
              paddingRight: "0.75rem",
              paddingBottom: "0.75rem",
              position: "relative",
            }}>
              <ServiceCertificates />
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
  services: mapToArr(state.services.entities),
}))(ServicesWindow);
