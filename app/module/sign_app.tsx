import { EventEmitter } from "events";

export class SignApp extends EventEmitter {
  sign_certs_info: any = null;
  sign_cert_info: any = null;
  SIGN_INFO_CHANGE = "sign_info_change";

  get get_sign_cert_info() {
    return this.sign_cert_info;
  }
  set set_sign_cert_info(sign_cert_info: any) {
    this.sign_cert_info = sign_cert_info;
    this.emit(SignApp.SIGN_INFO_CHANGE, sign_cert_info);
  }
  get get_sign_certs_info() {
    return this.sign_certs_info;
  }
  set set_sign_certs_info(sign_certs_info: any) {
    this.sign_certs_info = sign_certs_info;
    this.emit(SignApp.SIGN_INFO_CHANGE, sign_certs_info);
  }
}
export let sign = new SignApp().setMaxListeners(0);
