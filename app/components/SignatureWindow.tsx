import * as React from "react";
import { checkFiles, extFile, lang, LangApp } from "../module/global_app";
import { sign } from "../module/sign_app";
import * as native from "../native";
import * as signs from "../trusted/sign";
import { utils } from "../utils";
import BlockNotElements from "./BlockNotElements";
import BtnsForOperation from "./BtnsForOperation";
import CertificateBlockForSignature from "./CertificateBlockForSignature";
import { Dialog, FileComponents } from "./components";
import SignatureInfoBlock from "./SignatureInfoBlock";
import SignatureSettings from "./SignatureSettings";
import SignerCertificateInfo from "./SignerCertificateInfo";
//declare let $: any;

const dialog = window.electron.remote.dialog;

class SignatureWindow extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.change = this.change.bind(this);
  }

  componentDidMount() {
    lang.on(LangApp.SETTINGS, this.change);
  }

  componentWillUnmount() {
    lang.removeListener(LangApp.SETTINGS, this.change);
  }

  change() {
    this.setState({});
  }

  signed() {
    if (checkFiles("sign")) {
      let certItem = sign.get_sign_certificate;
      let key = window.PKISTORE.findKey(certItem);
      let res = true;

      if (!key) {
        $(".toast-key_not_found").remove();
        Materialize.toast(lang.get_resource.Sign.key_not_found, 2000, "toast-key_not_found");
        return;
      }

      let cert = window.PKISTORE.getPkiObject(certItem);
      let files = sign.get_files_for_sign;
      let pathes = files.slice(0);

      let policies = ["noAttributes"];

      let format = trusted.DataFormat.PEM;
      let folderOut = sign.get_settings_directory;

      if (folderOut.length > 0) {
        if (!utils.dirExists(folderOut)) {
          $(".toast-failed_find_directory").remove();
          Materialize.toast(lang.get_resource.Settings.failed_find_directory, 2000, "toast-failed_find_directory");
          return;
        }
      }

      if (sign.get_settings_detached) {
        policies.push("detached");
      }

      if (sign.get_settings_add_time) {
        policies.splice(0, 1);
      }

      if (sign.get_settings_encoding !== lang.get_resource.Settings.BASE) {
        format = trusted.DataFormat.DER;
      }
      pathes.forEach(function (uri: any, i: any) {
        let newPath = signs.signFile(uri.path, cert, key, policies, format, folderOut);
        if (newPath) {
          let birthtime = native.fs.statSync(newPath).birthtime;
          pathes[i].path = newPath;
          pathes[i].date = birthtime;
          pathes[i].name = native.path.basename(pathes[i].path);
          pathes[i].ext = extFile(pathes[i].name);
          pathes[i].verify_status = "default_status";
        } else {
          res = false;
        }
      });
      if (res) {
        let sign_info = sign.get_sign_info;
        let del_obj: any = [];
        for (let i = 0; i < pathes.length; i++) {
          for (let j = 0; j < sign_info.length; j++) {
            if (sign_info[j].key === pathes[i].key) {
              sign_info.splice(j, 1);
            }
          }
        }
        sign.set_files_for_sign = pathes;
        sign.set_sign_info_active = null;
        sign.set_sign_certs_info = null;

        $(".toast-files_signed").remove();
        Materialize.toast(lang.get_resource.Sign.files_signed, 2000, "toast-files_signed");
      } else {
        $(".toast-files_signed_failed").remove();
        Materialize.toast(lang.get_resource.Sign.files_signed_failed, 2000, "toast-files_signed_failed");
      }
    }
  }

  resign() {
    if (checkFiles("sign")) {
      let certItem = sign.get_sign_certificate;
      let key = window.PKISTORE.findKey(certItem);
      let res = true;
      let cms: trusted.cms.SignedData;

      if (!key) {
        $(".toast-key_not_found").remove();
        Materialize.toast(lang.get_resource.Sign.key_not_found, 2000, "toast-key_not_found");
        return;
      }

      let cert = window.PKISTORE.getPkiObject(certItem);
      let files = sign.get_files_for_sign;
      let pathes = files.slice(0);

      let policies = ["noAttributes"];

      let format = trusted.DataFormat.PEM;
      let folderOut = sign.get_settings_directory;

      if (folderOut.length > 0) {
        if (!utils.dirExists(folderOut)) {
          $(".toast-failed_find_directory").remove();
          Materialize.toast(lang.get_resource.Settings.failed_find_directory, 2000, "toast-failed_find_directory");
          return;
        }
      }

      if (sign.get_settings_add_time) {
        policies.splice(0, 1);
      }

      if (sign.get_settings_encoding !== lang.get_resource.Settings.BASE) {
        format = trusted.DataFormat.DER;
      }
      pathes.forEach(function (uri: any, i: any) {
        let newPath = signs.resignFile(uri.path, cert, key, policies, format, folderOut);
        if (newPath) {
          let birthtime = native.fs.statSync(newPath).birthtime;
          pathes[i].path = newPath;
          pathes[i].date = birthtime;
          pathes[i].name = native.path.basename(pathes[i].path);
          pathes[i].ext = extFile(pathes[i].name);
          pathes[i].verify_status = "default_status";
        } else {
          res = false;
        }
      });

      if (res) {
        let sign_info = sign.get_sign_info;
        let del_obj: any = [];
        for (let i = 0; i < pathes.length; i++) {
          for (let j = 0; j < sign_info.length; j++) {
            if (sign_info[j].key === pathes[i].key) {
              sign_info.splice(j, 1);
            }
          }
        }
        sign.set_files_for_sign = pathes;
        sign.set_sign_info_active = null;
        sign.set_sign_certs_info = null;

        $(".toast-files_resigned").remove();
        Materialize.toast(lang.get_resource.Sign.files_resigned, 2000, "toast-files_resigned");
      } else {
        $(".toast-files_resigned_failed").remove();
        Materialize.toast(lang.get_resource.Sign.files_resigned_failed, 2000, "toast-files_resigned_failed");
      }
    }
  }

  unSign() {
    if (checkFiles("sign")) {
      let files = sign.get_files_for_sign;
      let pathes = files.slice(0);
      let folderOut = sign.get_settings_directory;
      let res = true;

      pathes.forEach(function (path: any, i: any) {
        let newPath = signs.unSign(path.path, folderOut);
        let date = new Date();
        if (newPath) {
          pathes[i].path = newPath;
          pathes[i].date = date;
          pathes[i].name = native.path.basename(pathes[i].path);
          pathes[i].ext = extFile(pathes[i].name);
          if ($(".tooltipped")[path.key]) {
            $(".tooltipped")[path.key].className = "tooltipped";
          }
          pathes[i].verify_status = "default_status";
        } else {
          res = false;
        }
      });
      sign.set_files_for_sign = pathes;
      if (res) {
        sign.set_sign_info_active = null;
        sign.set_sign_certs_info = null;
        $(".toast-files_unsigned_ok").remove();
        Materialize.toast(lang.get_resource.Sign.files_unsigned_ok, 2000, "toast-files_unsigned_ok");
      } else {
        $(".toast-files_unsigned_failed").remove();
        Materialize.toast(lang.get_resource.Sign.files_unsigned_failed, 2000, "toast-files_unsigned_failed");
      }
    }
  }

  verifySign() {
    if (checkFiles("verify")) {
      let files = sign.get_files_for_sign;
      let pathes = files.slice(0);
      let res = false;
      let sign_files_info = sign.get_sign_info;
      let status: string;
      let cms: trusted.cms.SignedData;

      pathes.forEach(function (path: any, i: number) {
        if (!(cms = signs.loadSign(path.path))) {
          return;
        }

        if (cms.isDetached()) {
          if (!(cms = signs.setDetachedContent(cms, path.path))) {
            return;
          }
        }

        res = signs.verifySign(cms);
        status = res ? "status_ok" : "status_error";

        let sign_info = signs.getSignPropertys(cms);

        if (sign_info) {
          for (let j = 0; j < sign_info.length; j++) {
            if (!sign_info[j].status_verify) {
              status = "status_error";
              res = false;
            }
          }
        } else {
          res = false;
        }

        pathes[i].verify_status = status;

        let count = 0;
        for (let j = 0; j < sign_files_info.length; j++) {
          if (sign_files_info[j].key === pathes[i].key) {
            count = 1;
          }
        }
        if (count === 0) {
          sign_files_info.push({ name: pathes[i].name, path: pathes[i].path, key: pathes[i].key, info: sign_info });
        } else if (count === 1) {
          sign_files_info[i].info = sign_info;
        }
      });
      if (files.length === 1) {
        sign.set_sign_info_active = sign_files_info[files[0].key];
      }
      sign.set_sign_info = sign_files_info;
      sign.set_files_for_sign = pathes;
      if (res) {
        $(".toast-verify_sign_ok").remove();
        Materialize.toast(lang.get_resource.Sign.verify_sign_ok, 2000, "toast-verify_sign_ok");
      } else {
        $(".toast-verify_sign_founds_errors").remove();
        Materialize.toast(lang.get_resource.Sign.verify_sign_founds_errors, 2000, "toast-verify_sign_founds_errors");
      }
    }
  }

  render() {
    return (
      <div className="main">
        <Dialog />
        <div className="content">
          <div className="content-tem">
            <div className="col s6 m6 l6 content-item">
              <CertificateBlockForSignature />
            </div>
            <div className="col s6 m6 l6 content-item">
              <SignatureSettings />
            </div>
          </div>
          <SignatureInfoBlock />
          <SignerCertificateInfo />
          <div className="col s6 m6 l6 content-item-height">
            <BtnsForOperation
              btn_name_first={lang.get_resource.Sign.sign}
              btn_name_second={lang.get_resource.Sign.verify}
              btn_resign={lang.get_resource.Sign.resign}
              btn_unsign={lang.get_resource.Sign.unsign}
              operation_first={this.signed.bind(this)}
              operation_second={this.verifySign.bind(this)}
              operation_unsign={this.unSign.bind(this)}
              operation_resign={this.resign.bind(this)}
              operation="sign" />
            <FileComponents operation="sign" />
          </div>
        </div>
      </div>
    );
  }
}

export default SignatureWindow;
