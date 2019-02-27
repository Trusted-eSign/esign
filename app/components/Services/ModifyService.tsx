import { Map } from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { connect } from "react-redux";
import { changeServiceName, changeServiceSettings } from "../../AC/servicesActions";
import { CRYPTOPRO_DSS, CRYPTOPRO_SVS } from "../../constants";
import { MEGAFON } from "../../service/megafon/constants";
import CryptoProDssSettings from "./CryptoProDssSettings";
import CryptoProSVSSettings from "./CryptoProSVSSettings";
import MegafonSettings from "./MegafonSettings";
import { IService } from "./types";

interface IModifyServiceProps {
  changeServiceName: (id: string, name: string) => void;
  changeServiceSettings: (id: string, settings: {
    authURL: string;
    mobileNumber: string;
    restURL: string;
  }) => void;
  mapServices: Map<any, any>;
  service: IService;
  onCancel?: () => void;
}

interface IModifyServiceState {
  stateService: IService | undefined;
}

class ModifyService extends React.Component<IModifyServiceProps, IModifyServiceState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IModifyServiceProps) {
    super(props);

    this.state = ({
      stateService: undefined,
    });
  }

  componentDidMount() {
    const { service } = this.props;

    this.setState({ stateService: service });
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;
    const { service } = this.props;
    const { stateService } = this.state;

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

              {this.getBody(service, stateService)}

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
              <a className={"waves-effect waves-light btn btn_modal"} onClick={this.handleApply}>{localize("Common.apply", locale)}</a>
            </div>
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getBody = (service: IService | undefined, stateService: IService) => {
    if (service) {
      switch (service.type) {
        case MEGAFON:
          return <MegafonSettings
            nameChange={this.handleNameChange}
            mobileNumberChange={this.handleMobileNumberChange}
            service={stateService}
          />;

        case CRYPTOPRO_DSS:
          return <CryptoProDssSettings
            authURLChange={this.handleAuthChange}
            nameChange={this.handleNameChange}
            restURLChange={this.handleRestChange}
            service={stateService}
          />;

        case CRYPTOPRO_SVS:
          return <CryptoProSVSSettings
            hostNameChange={this.handleSVSHostNameChange}
            nameChange={this.handleNameChange}
            applicationNameChange={this.handleSVSApplicationNameChange}
            service={stateService}
          />;

        default:
          return null;
      }
    }
  }

  handleApply = () => {
    const { localize, locale } = this.context;
    // tslint:disable-next-line:no-shadowed-variable
    const { changeServiceName, changeServiceSettings, service } = this.props;
    const { stateService } = this.state;

    if (service.type && service.type === MEGAFON) {
      if (stateService && stateService.settings) {
        if (!stateService.settings.mobileNumber || !isValidPhoneNumber(stateService.settings.mobileNumber)) {
          $(".toast-invalid_phone_number").remove();
          Materialize.toast(localize("Services.invalid_phone_number", locale), 2000, "toast-invalid_phone_number");

          return;
        }

        changeServiceName(service.id, stateService.name);

        if (stateService.settings.mobileNumber !== service.settings.mobileNumber) {
          if (this.props.mapServices
            .get("entities")
            .find((item: IService) => item.settings.mobileNumber === stateService.settings.mobileNumber)
          ) {
            $(".toast-mobile_number_already_exists").remove();
            Materialize.toast(localize("Services.mobile_number_already_exists", locale), 2000, "toast-mobile_number_already_exists");
          } else {
            changeServiceSettings(service.id, stateService.settings);
          }
        }
      }
    }

    if (service.type && (service.type === CRYPTOPRO_DSS || service.type === CRYPTOPRO_SVS) && stateService) {
      if (stateService.name) {
        changeServiceName(service.id, stateService.name);
      }
      if (stateService.settings) {
        changeServiceSettings(service.id, stateService.settings);
      }
    }

    this.handelCancel();
  }

  handleReset = () => {
    const { service } = this.props;
    this.setState({ stateService: service });
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleNameChange = (ev: any) => {
    this.setState({ stateService: { ...this.state.stateService, name: ev.target.value } });
  }

  handleAuthChange = (ev: any) => {
    this.setState({ stateService: { ...this.state.stateService, settings: { ...this.state.stateService.settings, authURL: ev.target.value } } });
  }

  handleRestChange = (ev: any) => {
    this.setState({ stateService: { ...this.state.stateService, settings: { ...this.state.stateService.settings, restURL: ev.target.value } } });
  }

  handleMobileNumberChange = (value: any) => {
    this.setState({ stateService: { ...this.state.stateService, settings: { mobileNumber: value } } });
  }

  handleSVSHostNameChange = (ev: any) => {
    this.setState({ stateService: { ...this.state.stateService, settings: { ...this.state.stateService.settings, hostName: ev.target.value } } });
  }

  handleSVSApplicationNameChange = (ev: any) => {
    this.setState({ stateService: { ...this.state.stateService, settings: { ...this.state.stateService.settings, applicationName: ev.target.value } } });
  }
}

export default connect((state) => ({ mapServices: state.services }), { changeServiceName, changeServiceSettings })(ModifyService);
