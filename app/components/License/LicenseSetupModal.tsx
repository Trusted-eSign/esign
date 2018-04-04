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

const dialog = window.electron.remote.dialog;

interface ILicenseSetupModalProps {
  status: number;
  loading: boolean;
  closeWindow: () => void;
  loadLicense: () => void;
  verifyLicense: (key: string) => void;
}

interface ILicenseSetupModalState {
  license_file: string;
  license_key: string;
}

class LicenseSetupModal extends React.Component<ILicenseSetupModalProps, ILicenseSetupModalState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ILicenseSetupModalProps) {
    super(props);

    this.state = ({
      license_file: "",
      license_key: "",
    });
  }

  componentDidMount() {
    $("input#input_file, textarea#input_key").characterCounter();
  }

  paste() {
    $("#input_key").focus();
    document.execCommand("paste");
    $("#input_key").trigger("autoresize");
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
    let old_license = false;

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
      //validation of old format license
      let result = key.match( /[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}/ig );
      if(result != null){
        //validate
        old_license = true;
        data = {
            aud : '-',
            sub : 'CryptoARM GOST',
            core: 65535,
            iss : 'ООО "Цифровые технологии"',
            exp : 0,
            iat : '',
            jti : '',
            desc : 'CryptoARM GOST'
        } 
      }else{
        const splitLicense = key.split(".");
        if (splitLicense[1]) {
          try {
            buffer = new Buffer(toBase64(splitLicense[1]), "base64").toString("utf8");
            parsedLicense = JSON.parse(buffer);

            if (parsedLicense.exp && parsedLicense.aud && parsedLicense.iat && parsedLicense.iss
              && parsedLicense.jti && parsedLicense.sub) {
              data = parsedLicense;
            }
          } catch (e) {
            data = null;
          }
        }
      } 
    }

    if (data && data.sub !== "-") {
      status = jwt.checkLicense(key);
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

  openLicenseFile() {
    const { localize, locale } = this.context;

    if (!window.framework_NW) {
      const file = dialog.showOpenDialog({
        filters: [
          { name: localize("License.license", locale), extensions: ["lic"] },
        ],
        properties: ["openFile"],
      });
      if (file) {
        $("#input_file").focus();
        this.setState({ license_file: file[0], license_key: this.state.license_key });
      }
    }
  }

  render() {
    const { localize, locale } = this.context;
    const self = this;
    const disable = this.state.license_file || this.state.license_key ? "" : "disabled";

    return (
      <div id="add-licence-key" className="modal licence-modal">
        <div className="licence-modal-main">
          <HeaderWorkspaceBlock text={localize("License.enter_key", locale)} new_class="modal-bar" icon="close" onСlickBtn={this.props.closeWindow.bind(this)} />
          <div className="licence-modal-content">
            <div className="license-key">
              <div className="input-field col s6 input-field-licence">
                <i className="material-icons prefix key-prefix">vpn_key</i>
                <textarea id="input_key" className="materialize-textarea" value={this.state.license_key} onChange={function(e: any) {
                  self.setState({ license_file: self.state.license_file, license_key: e.target.value });
                }} />
                <label htmlFor="input_key">{localize("License.entered_the_key", locale)}</label>
                <a className="nav-small-btn waves-effect" onClick={this.paste.bind(this)}>
                  <i className="nav-small-icon material-icons">content_copy</i>
                </a>
              </div>
            </div>
            <div className="or">
              {localize("Common.or", locale)}
            </div>
            <div className="license-file">
              <div className="input-field col s6 input-field-licence">
                <i className="material-icons prefix key-prefix">vpn_key</i>
                <input id="input_file" type="text" value={this.state.license_file} onChange={function(e: any) {
                  self.setState({ license_file: e.target.value, license_key: self.state.license_key });
                }} />
                <label htmlFor="input_file">{localize("License.lic_file_choose", locale)}</label>
                <a className="nav-small-btn waves-effect" onClick={this.openLicenseFile.bind(this)}>
                  <i className="nav-small-icon material-icons">insert_drive_file</i>
                </a>
              </div>
            </div>
            <div className="license-btn">
              <a className={"waves-effect waves-light btn " + disable} onClick={this.setupLicense.bind(this)}>{localize("License.Entered", locale)}</a>
            </div>
          </div>
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
}, {loadLicense, verifyLicense})(LicenseSetupModal);
