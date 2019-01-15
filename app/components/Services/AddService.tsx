import { Map } from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { connect } from "react-redux";
import { signText } from "../../AC/megafonActions";
import { addService } from "../../AC/servicesActions";
import { CRYPTOPRO_DSS, CRYPTOPRO_DSS_NAME } from "../../constants";
import { MEGAFON, MEGAFON_NAME, SIGN_TEXT } from "../../service/megafon/constants";
import { statusCodes } from "../../service/megafon/statusCodes";
import { uuid } from "../../utils";
import CryptoProDssSettings from "./CryptoProDssSettings";
import MegafonSettings from "./MegafonSettings";
import { ICryptoProSettings, IMegafonSettings, IService } from "./types";

interface IAddServiceState {
  serviceName: string;
  serviceType: "MEGAFON" | "CRYPTOPRO_DSS";
  serviceSettings: IMegafonSettings & ICryptoProSettings;
}

const initialState = {
  serviceName: MEGAFON_NAME,
  serviceSettings: {
    authURL: "https://dss.cryptopro.ru/STS/oauth",
    mobileNumber: "",
    restURL: "https://dss.cryptopro.ru/SignServer/rest",
  },
  serviceType: MEGAFON,
};

interface IAddServiceProps {
  addService: (service: IService) => void;
  mapServices: Map<any, any>;
  megafon: any;
  onCancel: (service?: IService) => void;
  signText: (msisdn: string, text: string, signType: "Attached" | "Detached") => any;
}

class AddService extends React.Component<IAddServiceProps, IAddServiceState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IAddServiceProps) {
    super(props);

    this.state = { ...initialState };
  }

  componentDidMount() {
    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;
    const { serviceType } = this.state;

    return (
      <div className="add_new_service_modal">
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group" style={{
              boxshadow: "0 0 0 1px rgb(227, 227, 228)",
              height: "300px",
              overflow: "auto",
            }}>
              <div className="row">
                <div className="col s12">
                  <p className="label-csr">
                    {localize("Services.service_type", locale)}
                  </p>
                  <form action="#">
                    <p>
                      <input name="serviceType" type="radio"
                        checked={serviceType === MEGAFON}
                        id={MEGAFON}
                        onClick={() => this.handleChangeServiceType(MEGAFON)}
                      />
                      <label htmlFor={MEGAFON} >
                        {localize("Services.megafon", locale)}
                      </label>
                    </p>
                    <p>
                      <input name="serviceType" type="radio"
                        checked={serviceType === CRYPTOPRO_DSS}
                        id={CRYPTOPRO_DSS}
                        onClick={() => this.handleChangeServiceType(CRYPTOPRO_DSS)} />
                      <label htmlFor={CRYPTOPRO_DSS}>
                        {localize("Services.cryptopro_dss", locale)}
                      </label>
                    </p>
                  </form>
                </div>
              </div>
              <div className="row">
                {this.getServiceSettings()}
              </div>
            </div>

          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s6 offset-s5">
            <div className="col s7">
              <a className={"waves-effect waves-light btn btn_modal"} onClick={this.handleAdd}>{localize("Services.connect", locale)}</a>
            </div>
            <div className="col s5">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getServiceSettings = () => {
    const { serviceName, serviceType, serviceSettings } = this.state;

    switch (serviceType) {
      case MEGAFON:
        return (
          <MegafonSettings
            nameChange={this.handleServiceNameChange}
            mobileNumberChange={this.handleMobileNumberChange}
            service={{ settings: serviceSettings, name: serviceName }}
          />

        );

      case CRYPTOPRO_DSS:
        return (
          <CryptoProDssSettings
            authURLChange={this.handleAuthChange}
            nameChange={this.handleServiceNameChange}
            restURLChange={this.handleRestChange}
            service={{ settings: serviceSettings, name: serviceName }}
          />
        );

      default:
        return null;
    }
  }

  handleMobileNumberChange = (value: any) => {
    this.setState({ serviceSettings: { ...this.state.serviceSettings, mobileNumber: value } });
  }

  handleAuthChange = (ev: any) => {
    this.setState({ serviceSettings: { ...this.state.serviceSettings, authURL: ev.target.value } });
  }

  handleRestChange = (ev: any) => {
    this.setState({ serviceSettings: { ...this.state.serviceSettings, restURL: ev.target.value } });
  }

  handleServiceNameChange = (ev: any) => {
    this.setState({ serviceName: ev.target.value });
  }

  handleChangeServiceType = (type: "MEGAFON" | "CRYPTOPRO_DSS") => {
    this.setState({ serviceType: type });

    switch (type) {
      case MEGAFON:
        this.setState({ serviceName: MEGAFON_NAME });
        return;
      case CRYPTOPRO_DSS:
        this.setState({ serviceName: CRYPTOPRO_DSS_NAME });
        return;
    }
  }

  handleAdd = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { addService, onCancel, signText } = this.props;
    const { serviceName, serviceSettings, serviceType } = this.state;
    const { localize, locale } = this.context;

    const id = uuid();
    const service: IService = {
      id,
      name: serviceName,
      settings: serviceSettings,
      type: serviceType,
    };

    if (service.type === MEGAFON) {
      if (this.props.megafon.isStarted) {
        $(".toast-already_started").remove();
        Materialize.toast(localize("Services.already_started", locale), 2000, "toast-already_started");

        return;
      }

      if (service.settings && !service.settings.mobileNumber || !isValidPhoneNumber(service.settings.mobileNumber)) {
        $(".toast-invalid_phone_number").remove();
        Materialize.toast(localize("Services.invalid_phone_number", locale), 2000, "toast-invalid_phone_number");

        return;
      }

      if (this.props.mapServices
        .get("entities")
        .find((item: IService) => item.settings.mobileNumber === service.settings.mobileNumber)
      ) {
        $(".toast-mobile_number_already_exists").remove();
        Materialize.toast(localize("Services.mobile_number_already_exists", locale), 2000, "toast-mobile_number_already_exists");

        return;
      }
    }

    addService(service);

    onCancel(service);

    if (service && service.type) {
      if (service.type === MEGAFON) {
        signText(service.settings.mobileNumber, Buffer.from("Подключение сервиса в КриптоАРМ ГОСТ", "utf8").toString("base64"), "Attached")
          .then(
            (response) => Materialize.toast("Запрос успешно отправлен", 2000, "toast-mep_status_true"),
            (error) => {
              $(".toast-mep_status").remove();
              Materialize.toast(statusCodes[SIGN_TEXT][error], 2000, "toast-mep_status");
            },
          );
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

export default connect((state) => ({
  mapServices: state.services,
  megafon: state.megafon.toJS()
}), { addService, signText })(AddService);
