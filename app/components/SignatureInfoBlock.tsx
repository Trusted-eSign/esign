import * as React from "react";
import { lang, LangApp } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SignatureStatus from "./SignatureStatus";

class SignatureInfoBlock extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.changeSettings = this.changeSettings.bind(this);
  }

  componentDidMount() {
    sign.on(SignApp.SIGN_INFO_CHANGE, this.changeSettings);
  }

  componentWillUnmount() {
    sign.removeListener(SignApp.SIGN_INFO_CHANGE, this.changeSettings);
  }

  changeSettings() {
    this.setState({});
  }

  removeSignInfo() {
    sign.set_sign_info_active = null;
  }

  render() {
    const self = this;
    const signInfo = sign.get_sign_info_active;
    const fileName = signInfo && signInfo.name ? signInfo.name : "";
    const statusVerify = this.props.signed_data && this.props.signed_data.status_verify ? "status_ok" : "";
    const signsList = signInfo && signInfo.info ? signInfo.info : [];
    const hiddenSignInfo = signInfo && !sign.get_sign_certs_info ? "" : "hidden";
    const hiddenSignCertInfo = sign.get_sign_certs_info ? "" : "hidden";

    const elements = signsList.map(function(cert: any, index: number) {
      return <SignatureStatus key={index} signed_data={cert} />;
    });

    return (
      <div className={"col s6 m6 l6 sign-info content-item-height " + hiddenSignInfo}>
        <div className="file-content-height">
          <div className="content-wrapper z-depth-1">
            <HeaderWorkspaceBlock icon="arrow_back" onСlickBtn={this.removeSignInfo.bind(this)} text={lang.get_resource.Sign.sign_info} second_text={fileName} />
            <div className="sign-info-content">
              <div className={"add-cert-collection collection "}>
                {elements}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignatureInfoBlock;
