import PropTypes from "prop-types";
import React from "react";
import { MEGAFON } from "../../service/megafon/constants";
import MegafonSettings from "./MegafonSettings";
import { IService } from "./types";

interface IModifyServiceProps {
  onCancel?: () => void;
  service: IService | undefined;
}

class ModifyService extends React.Component<IModifyServiceProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IModifyServiceProps) {
    super(props);
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;
    const { service } = this.props;

    return (
      <div style={{
        height: "250px",
      }}>
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group" style={{
              boxshadow: "0 0 0 1px rgb(227, 227, 228)",
              height: "200px",
              overflow: "auto",
            }}>

              {this.getBody(service)}

            </div>
          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s6 offset-s9">
            <div className="col s3">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getBody = (service: IService | undefined) => {
    if (service) {
      switch (service.type) {
        case MEGAFON:
          return <MegafonSettings serviceId={service.id} />;

        default:
          return null;
      }
    }
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }
}

export default ModifyService;
