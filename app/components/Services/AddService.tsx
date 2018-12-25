import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { signText } from "../../AC/megafonActions";
import { addService } from "../../AC/servicesActions";
import { MEGAFON, SIGN_TEXT } from "../../service/megafon/constants";
import { statusCodes } from "../../service/megafon/statusCodes";
import { uuid } from "../../utils";
import { IMegafonSettings, IService } from "./types";

const CRYPTOPRO_DSS = "CRYPTOPRO_DSS";

interface IAddServiceState {
  serviceName: string;
  serviceType: string;
  serviceSettings: IMegafonSettings;
}

const initialState = {
  serviceName: "МЭП Мегафон",
  serviceSettings: {
    mobileNumber: "+7",
  },
  serviceType: MEGAFON,
};

interface IAddServiceProps {
  addService: (service: IService) => void;
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
    const { serviceName, serviceSettings } = this.state;
    const { mobileNumber } = serviceSettings;

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
                        checked={true}
                        id={MEGAFON}
                        onClick={() => this.handleChangeServiceType(MEGAFON)}
                      />
                      <label htmlFor={MEGAFON} >
                        {localize("Services.megafon", locale)}
                      </label>
                    </p>
                    <p>
                      <input name="serviceType" type="radio" id={CRYPTOPRO_DSS} disabled={true}
                        onClick={() => this.handleChangeServiceType(CRYPTOPRO_DSS)} />
                      <label htmlFor={CRYPTOPRO_DSS}>
                        {localize("Services.cryptopro_dss", locale)}
                      </label>
                    </p>
                  </form>
                </div>
              </div>
              <div className="row">
                <div className="input-field input-field-csr col s12">
                  <input
                    id="serviceName"
                    type="text"
                    className={"validate"}
                    name="serviceName"
                    value={serviceName}
                    placeholder={localize("Services.write_service_name", locale)}
                    onChange={this.handleServiceNameChange}
                  />
                  <label htmlFor="serviceName">
                    {localize("Services.name", locale)}
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="input-field input-field-csr col s12">
                  <input
                    id="mobileNumber"
                    type="text"
                    className={"validate"}
                    name="mobileNumber"
                    value={mobileNumber}
                    placeholder={localize("Services.write_mobile_number", locale)}
                    onChange={this.handleMobileNumberChange}
                  />
                  <label htmlFor="mobileNumber">
                    {localize("Services.mobile_number", locale)}
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s6 offset-s5">
            <div className="col s7">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleAdd}>{localize("Services.connect", locale)}</a>
            </div>
            <div className="col s5">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleMobileNumberChange = (ev: any) => {
    const { localize, locale } = this.context;

    const value = ev.target.value;
    const pattern = /^(\+7)(\d){0,10}$/g;

    if (pattern.test(value)) {
      this.setState({ serviceSettings: { mobileNumber: value } });
    } else {
      $(".toast-invalid_character").remove();
      Materialize.toast(localize("Services.invalid_character", locale), 2000, "toast-invalid_character");
    }
  }

  handleServiceNameChange = (ev: any) => {
    this.setState({ serviceName: ev.target.value });
  }

  handleChangeServiceType = (type: string) => {
    this.setState({ serviceType: type });
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

    addService(service);

    onCancel(service);

    if (service && service.type) {
      if (service.type === MEGAFON) {
        if (service.settings && service.settings.mobileNumber && service.settings.mobileNumber.length === 12) {
          signText(service.settings.mobileNumber, Buffer.from("Подключение сервиса в КриптоАРМ ГОСТ", "utf8").toString("base64"), "Attached")
            .then(
              (response) => Materialize.toast("Запрос успешно отправлен", 2000, "toast-mep_status_true"),
              (error) => {
                $(".toast-mep_status").remove();
                Materialize.toast(statusCodes[SIGN_TEXT][error], 2000, "toast-mep_status");
              },
            );
        } else {
          $(".toast-write_mobile_number").remove();
          Materialize.toast(localize("Services.write_mobile_number", locale), 2000, "toast-write_mobile_number");
        }
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

export default connect(() => ({}), { addService, signText })(AddService);
