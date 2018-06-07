import PropTypes from "prop-types";
import React from "react";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

class PasswordDialog extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      active: "not-active",
    });
  }

  componentDidMount(): void {
    $("input#input_password").characterCounter();
  }

  closeModal = () => {
    const { onChange } = this.props;

    this.setState({
      active: "not-active",
    });

    if (onChange) {
      onChange("");
    }

    $("#get-password").closeModal();
  }

  handleChange = (ev: any) => {
    const { onChange } = this.props;
    if (!onChange) {
      return;
    }

    onChange(ev.target.value);
  }

  render() {
    const { localize, locale } = this.context;
    const { value } = this.props;

    let active = "";

    if (value && value.length > 0) {
      active = "active";
    }

    return (
      <div id="get-password" className="modal password-modal">
        <div className="password-modal-main">
          <HeaderWorkspaceBlock text={localize("Settings.pass_enter", locale)} new_class="modal-bar" icon="close" onСlickBtn={this.closeModal} />
          <div className="password-modal-content">
            <div className="input-password">
              <div className="input-field col s8 input-field-password">
                <i className={"material-icons prefix key-prefix"}>vpn_key</i>
                <input id="input_password" type="password" value={value} onChange={this.handleChange} />
                <label htmlFor="input_password" className={active}>{localize("Settings.password", locale)}</label>
              </div>
              <div className="col s4">
                <a className="waves-effect waves-light btn modal-close" id="enter-pass">{localize("License.Entered", locale)}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PasswordDialog;
