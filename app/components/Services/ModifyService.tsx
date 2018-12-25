import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { changeServiceName, changeServiceSettings } from "../../AC/servicesActions";
import { MEGAFON } from "../../service/megafon/constants";
import MegafonSettings from "./MegafonSettings";
import { IService } from "./types";

const initialState = {
  id: "",
  name: "",
  settings: {
    mobileNumber: "+7",
  },
  type: "MEGAFON",
};

interface IModifyServiceProps {
  changeServiceName: (id: string, name: string) => void;
  changeServiceSettings: (id: string, settings: {
    mobileNumber: string;
  }) => void;
  service: IService;
  onCancel?: () => void;
}

interface IModifyServiceState {
  service: IService;
}

class ModifyService extends React.Component<IModifyServiceProps, IModifyServiceState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IModifyServiceProps) {
    super(props);
  }

  componentDidMount() {
    const { service } = this.props;

    this.setState({ service });
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
          <div className="col s3">
            <a className={"waves-effect waves-light btn btn_modal"} onClick={this.handleReset}>{localize("Common.reset", locale)}</a>
          </div>
          <div className="col s6 offset-s3">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleApply}>{localize("Common.apply", locale)}</a>
            </div>
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getBody = (service: IService | undefined) => {
    if (service) {
      const stateService = this.state.service;

      switch (service.type) {
        case MEGAFON:
          return <MegafonSettings
            nameChange={this.handleNameChange}
            mobileNumberChange={this.handleMobileNumberChange}
            service={stateService}
          />;

        default:
          return null;
      }
    }
  }

  handleApply = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeServiceName, changeServiceSettings, service } = this.props;

    changeServiceName(service.id, this.state.service.name);
    changeServiceSettings(service.id, this.state.service.settings);

    this.handelCancel();
  }

  handleReset = () => {
    const { service } = this.props;
    this.setState({ service });
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleNameChange = (ev: any) => {
    this.setState({ service: { ...this.state.service, name: ev.target.value } });
  }

  handleMobileNumberChange = (ev: any) => {
    const { localize, locale } = this.context;

    const value = ev.target.value;
    const pattern = /^(\+7)(\d){0,10}$/g;

    if (pattern.test(value)) {
      this.setState({ service: { ...this.state.service, settings: { mobileNumber: value } } });
    } else {
      $(".toast-invalid_character").remove();
      Materialize.toast(localize("Services.invalid_character", locale), 2000, "toast-invalid_character");
    }
  }
}

export default connect(() => ({}), { changeServiceName, changeServiceSettings })(ModifyService);
