import * as React from "react";
import MainWindow from "./MainWindow";
import MainWindowOperation from "./MainWindowOperation";

class MainWindowWorkSpace extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div>
        <div className="header image">
          <div className="row">
            <div className="col s4">
              <i className="logo"></i>
            </div>
            <div className="col s8">
              <div className="white-text cryptobanner">
                <p>{localize("About.info_about_product", locale)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="maincontent">
          <div className="appfunction">
            <div className="row">
              <MainWindowOperation
                info={localize("About.info_about_sign", locale)}
                title_pre={localize("Settings.Digital", locale)}
                title_post={localize("Sign.Signature", locale)}
                operation="sign"
              />
              <MainWindowOperation
                info={localize("About.info_about_encrypt", locale)}
                title_pre={localize("Encrypt.Encryption", locale)}
                title_post={localize("Settings.Datas", locale)}
                operation="encrypt"
              />
              <MainWindowOperation
                info={localize("About.info_about_certificate", locale)}
                title_pre={localize("Settings.Control", locale)}
                title_post={localize("Certificate.FCertificates", locale)}
                operation="certificate"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainWindowWorkSpace;
