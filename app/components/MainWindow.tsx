import PropTypes from "prop-types";
import * as React from "react";
import Footer from "./Footer";
import MainWindowOperation from "./MainWindowOperation";

class MainWindow extends React.Component<{}, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="main">
        <div className="main-window">
          <div className="main-window-workspace">
            <div className="header image">
              <div className="row">
                <div className="col s3">
                  <i className="logo" />
                </div>
                <div className="col s9">
                  <div className="white-text cryptobanner">
                    <p>{localize("About.info_about_product", locale)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="maincontent">
                <div className="appfunction">
                  <div className="row">
                    <div className="col s4">
                      <MainWindowOperation
                        info={localize("About.info_about_sign", locale)}
                        title_pre={localize("Settings.Digital", locale)}
                        title_post={localize("Sign.Signature", locale)}
                        operation="sign"
                      />
                    </div>
                    <div className="col s4">
                      <MainWindowOperation
                        info={localize("About.info_about_encrypt", locale)}
                        title_pre={localize("Encrypt.Encryption", locale)}
                        title_post={localize("Settings.Datas", locale)}
                        operation="encrypt"
                      />
                    </div>
                    <div className="col s4">
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
            </div>
          </div>
          <div className="row">
            <Footer />
          </div>
        </div>
      </div>
    );
  }
}

export default MainWindow;
