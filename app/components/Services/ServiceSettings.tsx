import PropTypes from "prop-types";
import React from "react";
import { MEGAFON } from "../../service/megafon/constants";
import BlockNotElements from "../BlockNotElements";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import MegafonSettings from "./MegafonSettings";
import { IService } from "./types";

interface IServiceSettingsProps {
  service: IService | undefined;
}

class ServiceSettings extends React.PureComponent<IServiceSettingsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IServiceSettingsProps) {
    super(props);
  }

  render() {
    const { localize, locale } = this.context;
    const { service } = this.props;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Services.service_settings", locale)} />
        {this.getBody(service)}
      </div>
    );
  }

  getBody = (service: IService | undefined) => {
    const { localize, locale } = this.context;

    if (service) {
      switch (service.type) {
        case MEGAFON:
          return <MegafonSettings serviceId={service.id}/>;

        default:
          return null;
      }
    } else {
      return <BlockNotElements name="active" title={localize("Services.service_not_selected", locale)}/>;
    }
  }
}

export default ServiceSettings;
