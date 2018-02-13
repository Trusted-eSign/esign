import * as fs from "fs";
import * as npath from "path";
import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { loadLicense, verifyLicense } from "../../AC";
import { LICENSE_PATH, PLATFORM } from "../../constants";
import * as jwt from "../../trusted/jwt";
import { toBase64 } from "../../utils";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
// import ReCAPTCHA from "react-google-recaptcha";

const dialog = window.electron.remote.dialog;

interface ILicenseTemporaryModalProps {
  closeWindow: () => void;
  loadLicense: () => void;
  verifyLicense: (key: string) => void;
}

interface ILicenseTemporaryModalState {
  username: {
    text: string,
    error: string,
  };
  email: {
    text: string,
    error: string,
  };
  request: {status: string};
  license_key: string;
  license_file: string;
}

class LicenseTemporaryModal extends React.Component<ILicenseTemporaryModalProps, ILicenseTemporaryModalState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ILicenseTemporaryModalProps) {
    super(props);
    this.state = ({
      username: { text: "", error: "" },      
      email: { text: "", error: "" },
      request: {status: 'start'}, 
      license_file: "",
      license_key: ""
    });
  }

  setupLicense() {
    const { localize, locale } = this.context;
    const { license_key, license_file } = this.state;
    // tslint:disable-next-line:no-shadowed-variable
    const { loadLicense, verifyLicense } = this.props;

    const path = npath.dirname(LICENSE_PATH);
    const options = {
      name: "CryptoARM GOST",
    };

    let command = "";
    let status: any;

    if (PLATFORM !== "win32") {
      command = "sh -c " + "\"";
      command = command + "mkdir -p " + "'" + path + "'" + " && ";
    } else {
      if (!fs.existsSync(path)) {
        command = command + " mkdir " + '"' + path + '"' + " && ";
      }
    }

    let data = null;
    let key;

    if (license_key) {
      key = license_key;
    } else if (fs.existsSync(license_file)) {
      const licFileContent: string = fs.readFileSync(license_file, "utf8");

      if (licFileContent) {
        key = licFileContent.trim();
      } else {
        $(".toast-read_file_error").remove();
        Materialize.toast(localize("Common.read_file_error", locale), 2000, "toast-read_file_error");
      }
    } else {
      $(".toast-lic_file_not_found").remove();
      Materialize.toast(localize("License.lic_file_not_found", locale), 2000, "toast-lic_file_not_found");
    }

    if (!key) {
      $(".toast-lic_key_uncorrect").remove();
      Materialize.toast(localize("License.lic_key_uncorrect", locale), 2000, "toast-lic_key_uncorrect");
    } else {
      let parsedLicense;
      let buffer;

      const splitLicense = key.split(".");

      if (splitLicense[1]) {
        try {
          buffer = new Buffer(toBase64(splitLicense[1]), "base64").toString("utf8");
          parsedLicense = JSON.parse(buffer);

          if (parsedLicense.exp && parsedLicense.aud && parsedLicense.iat && parsedLicense.iss
            && parsedLicense.jti && parsedLicense.sub) {
            data = parsedLicense;
            //console.log(data);
          }
        } catch (e) {
          data = null;
        }
      }
    }

    if (data && data.sub !== "-") {
      //status = jwt.checkLicense(key); //Нужно убрать проверку на начало действия лицензии
      status = 0;

      if (status === 0) {
        if (PLATFORM === "win32") {
          command = command + "echo " + key.trim() + " > " + '"' + LICENSE_PATH + '"';
        } else {
          command = command + " printf " + key.trim() + " > " + "'" + LICENSE_PATH + "'" + " && ";
          command = command + " chmod 777 " + "'" + LICENSE_PATH + "'" + "\"";
        }
        window.sudo.exec(command, options, function(error: any) {
          if (!error) {
            trusted.common.OpenSSL.stop();
            trusted.common.OpenSSL.run();

            loadLicense();
            verifyLicense(key);

            $(".toast-lic_key_setup").remove();
            Materialize.toast(localize("License.lic_key_setup", locale), 2000, "toast-lic_key_setup");
          } else {
            $(".toast-write_file_error").remove();
            Materialize.toast(localize("Common.write_file_error", locale), 2000, "toast-write_file_error");
          }
        });
      } else {
        $(".toast-status.message").remove();
        Materialize.toast(localize(jwt.getErrorMessage(status), locale), 2000, "toast-status.message");
      }
    } else {
      $(".toast-lic_key_uncorrect").remove();
      Materialize.toast(localize("License.lic_key_uncorrect", locale), 2000, "toast-lic_key_uncorrect");
    }

    this.props.closeWindow();
  }

  // openLicenseFile() {
  //   const { localize, locale } = this.context;

  //   if (!window.framework_NW) {
  //     const file = dialog.showOpenDialog({
  //       filters: [
  //         { name: localize("License.license", locale), extensions: ["lic"] },
  //       ],
  //       properties: ["openFile"],
  //     });
  //     if (file) {
  //       $("#input_file").focus();
  //       this.setState({ license_file: file[0], license_key: this.state.license_key });
  //     }
  //   }
  // }

  cleanState = () => {
    this.setState(
      {
        username: { text: "", error: "" },        
        email: { text: "", error: "" },
      });
  }

  componentDidMount() {
    $("input#input_file, textarea#input_key").characterCounter();
  }

  send = () => {
    const { localize, locale } = this.context;
    const self = this;
  //   const sendReq: any = window.request.get({uri: "https://licensesvc.trusted.ru/license/jwt/getfree", rejectUnauthorized: false });
  //       sendReq.on("response", (response) => {
  //         switch (response.statusCode) {
  //           case 200:
  //             response.on("data", function(data) {
  //               console.log("data", data.toString());
  //             });
  //             break;
  //           default:
  //             console.log("error status code", response.statusCode);
  //         }
  //       });
  //       sendReq.on("error", (err) => {
  //         console.log("err", err);
  //       });
    
    $.ajax({
      method: "GET",   
      headers: {
        'verify_peer' : 'false',
        'verify_peer_name': 'false',
      }, 
      data: {
        email: this.state.email.text,
        username: this.state.username.text,
        sub: "CryptoARM GOST",
      },
      url: "https://licensesvc.trusted.ru/license/jwt/getfree",
      success: function(response){ 
        self.cleanState();
        $(".toast-message_send").remove();
        Materialize.toast(localize("About.message_send", locale), 2000, "toast-message_send");
        if(response.code == 200 && response.success == true){
              console.log(response.data);  
              self.setState({ request: { status: 'ok' }});
              self.setState({ license_key: response.data });
        }     
      },
      error: function(response) {
        $(".toast-error_message_send").remove();
        Materialize.toast(localize("About.error_message_send", locale), 2000, "toast-error_message_send");
        //console.log(response);
        self.setState({ request: { status: 'error' }});
      },
    });
  }

  setUserName = (user: string) => {
    this.setState({ username: { text: user, error: "" } });
  }

  setEmail = (email: string) => {
    this.setState({ email: { text: email, error: "" } });
  }

  setRequestStatus = (status: string) => {
    this.setState({ request: { status: status} });
  }

  setLicenseKey = (key: string) => {
    this.setState({ license_key: key });
  }


  validDatas = () => {
    const { localize, locale } = this.context;

    const REQULAR_EXPRESSION = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (this.state.username.text.length === 0) {
      this.state.username.error = localize("Settings.field_empty", locale);
      this.setState({ username: { text: this.state.username.text, error: localize("Settings.field_empty", locale) } });
    }
    if (this.state.email.text.length === 0) {
      this.state.email.error = localize("Settings.field_empty", locale);
      this.setState({ email: { text: this.state.email.text, error: localize("Settings.field_empty", locale) } });
    } else if (REQULAR_EXPRESSION.test(this.state.email.text) === false) {
      this.state.email.error = localize("Settings.email_error", locale);
      this.setState({ email: { text: this.state.email.text, error: localize("Settings.email_error", locale) } });
    }
    if (this.state.email.error.length === 0 && this.state.username.error.length === 0) {
      this.send();
    }
    // captcha.execute();
  }

  viewStepMaster() {
    const { username, email, request } = this.state;
    const { localize, locale } = this.context;

    let errUser = "";
    let errEmail = "";
    let errLicenseRequest = "";

    if (this.state.username.error.length === 0) {
      errUser = "not-active";
    }
    if (this.state.email.error.length === 0) {
      errEmail = "not-active";
    }

    //Запрос не отправлен
    if (request.status=='start') {
      return (
        <div className="licence-modal-content">
          <form onSubmit={this.validDatas}>
          <p className="desctoplic_text">{localize("License.overtimes_license_confirm", locale)}</p> 
          <div className="row"> 
          <div className="col s6">
            <div className="row form">
              <div className="input-field col s12 noborder">
                <input id="username" type="text" value={username.text} onChange={(evt) => this.setUserName(evt.target.value)}></input>
                <label htmlFor="username">{localize("About.username", locale)}</label>
              </div>
              <div className={"about-error-info " + errUser}>
                <i className="material-icons icon-error">warning</i>
                <div className="error-text about-text">{this.state.username.error}</div>
              </div>
            </div>
          </div>
          <div className="col s6">
            <div className="row form">
              <div className="input-field col s12 noborder">
                <input id="email" type="email" className="validate" value={email.text} onChange={(evt) => this.setEmail(evt.target.value)}></input>
                <label htmlFor="email" >{localize("About.email", locale)}</label>
              </div>
              <div className={"about-error-info " + errEmail}>
                <i className="material-icons icon-error">warning</i>
                <div className="error-text about-text">{this.state.email.error}</div>
              </div>
            </div>
          </div>
          </div>
        </form>
        <div className="license-btn">
            <a className="waves-effect waves-light btn" onClick={this.validDatas}>{localize("License.License_reques_send", locale)}</a>
        </div>
       </div>
      );
    } else if(request.status=='ok'){
      return (
        <div className="licence-modal-content">
          <div className="row">
            <div className="col s2">
                <div className="alert_ok_icon" />
            </div>
            <div className="col s10">
              <p className="desctoplic_text">{localize("License.overtimes_license_ok", locale)}</p>
            </div> 
          </div>
          <div className="license-btn">
            <a className="waves-effect waves-light btn" onClick={this.setupLicense.bind(this)}>{localize("License.Enter_license", locale)}</a>
          </div>
        </div>
      );
    } else if(request.status=='error'){
      return (
        <div className="licence-modal-content">
          <div className="row">
            <div className="col s2">
                <div className="alert_error_icon" />
            </div>
            <div className="col s10">
              <p className="desctoplic_text">{localize("License.overtimes_license_error", locale)}</p>
            </div> 
          </div>
          <div className="license-btn">
              <a className="waves-effect waves-light btn" onClick={this.props.closeWindow.bind(this)}>{localize("License.Сlose", locale)}</a>
          </div>
        </div>
      );
    }
  }


  render() {
    const { localize, locale } = this.context;
    const self = this;
    const { email, username } = this.state;

    return (
      <div id="licence-temporary-modal" className="modal licence-modal">
        <div className="licence-modal-main">
          <HeaderWorkspaceBlock text={localize("License.get_overtimes_license", locale)} new_class="modal-bar" icon="close" onСlickBtn={this.props.closeWindow.bind(this)} />
          {this.viewStepMaster()}
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    loading: state.license.loading,
    status: state.license.status,
  };
}, {loadLicense, verifyLicense})(LicenseTemporaryModal);