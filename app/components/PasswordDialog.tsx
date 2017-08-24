import * as React from "react";
import { lang } from "../module/global_app";
import { application } from "./certificate";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

class PasswordDialog extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = ({
      active: "not-active",
      pass_value: "",
    });
  }

  componentDidMount(): void {
    $("input#input_password").characterCounter();
  }

  verifyValid(): void {
    this.setState({
      active: "not-active",
    });

    application.emit("pass_value", this.state.pass_value);
    $("#get-password").closeModal();
    this.setState({ pass_value: "" });
  }

  closeModal() {
    this.setState({
      active: "not-active",
    });

    application.emit("pass_value", "");
    $("#get-password").closeModal();
    this.setState({ pass_value: "" });
  }

  changePassValue(event: any): void {
    this.setState({
      pass_value: event,
    });
  }

  keyDownPassword() {
    const clickEvent = document.createEvent("MouseEvents");
    clickEvent.initEvent("click", true, true);
    document.querySelector("#enter-pass").dispatchEvent(clickEvent);
  }

  render(): any {
    const self = this;
    let active = "";

    if (this.state.pass_value.length > 0) {
      active = "active";
    }

    return (
      <div id="get-password" className="modal password-modal">
        <div className="password-modal-main">
          <HeaderWorkspaceBlock text={lang.get_resource.Settings.pass_enter} new_class="modal-bar" icon="close" onСlickBtn={this.closeModal.bind(this)} />
          <div className="password-modal-content">
            <div className="input-password">
              <div className="input-field col s6 input-field-password">
                <i className={"material-icons prefix key-prefix " + active}>vpn_key</i>
                <input id="input_password" type="password" value={this.state.pass_value}
                  onKeyDown={
                    function(evt: any) {
                      if (evt.keyCode === 13) {
                        self.keyDownPassword();
                      }
                    }
                  }
                  onChange={
                    function(event: any): void {
                      self.changePassValue(event.target.value);
                    }
                  }
                />
                <label htmlFor="input_password" className={active}>{lang.get_resource.Settings.password}</label>
              </div>
              <a className="waves-effect waves-light btn modal-close" id="enter-pass" onClick={this.verifyValid.bind(this)}>{lang.get_resource.License.Entered}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PasswordDialog;
