import PropTypes from "prop-types";
import React from "react";
import { MEGAFON } from "../../service/megafon/constants";
import BlockNotElements from "../BlockNotElements";
import Modal from "../Modal";
import DeleteService from "./DeleteService";
import MegafonSettings from "./MegafonSettings";
import { IService } from "./types";

interface IServiceSettingsProps {
  service: IService | undefined;
}

interface IServiceSettingsState {
  showModalDeleteService: boolean;
}

class ServiceSettings extends React.PureComponent<IServiceSettingsProps, IServiceSettingsState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IServiceSettingsProps) {
    super(props);

    this.state = ({
      showModalDeleteService: false,
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
  }

  render() {
    const { localize, locale } = this.context;
    const { service } = this.props;

    const DISABLED = service ? "" : "disabled";

    return (
      <div className="content-wrapper z-depth-1">
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
                <li><a onClick={() => this.handleShowModalDeleteService()}>{localize("Services.delete", locale)}</a></li>
              </ul>
            </li>
          </ul>
        </nav>
        {this.getBody(service)}
        {this.showModalDeleteService()}
      </div>
    );
  }

  getBody = (service: IService | undefined) => {
    const { localize, locale } = this.context;

    if (service) {
      switch (service.type) {
        case MEGAFON:
          return <MegafonSettings serviceId={service.id} />;

        default:
          return null;
      }
    } else {
      return <BlockNotElements name="active" title={localize("Services.service_not_selected", locale)} />;
    }
  }

  showModalDeleteService = () => {
    const { localize, locale } = this.context;
    const { showModalDeleteService } = this.state;
    const { service } = this.props;

    if (!service || !showModalDeleteService) {
      return;
    }

    return (
      <Modal
        isOpen={showModalDeleteService}
        header={localize("Services.delete_service", locale)}
        onClose={this.handleCloseModalDeleteService}>

        <DeleteService
          service={service}
          onCancel={this.handleCloseModalDeleteService} />
      </Modal>
    );
  }

  handleShowModalDeleteService = () => {
    this.setState({ showModalDeleteService: true });
  }

  handleCloseModalDeleteService = () => {
    this.setState({ showModalDeleteService: false });
  }
}

export default ServiceSettings;
