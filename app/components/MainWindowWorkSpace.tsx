import * as React from "react";
import { lang } from "../module/global_app";
import MainWindow from "./MainWindow";
import MainWindowOperation from "./MainWindowOperation";

class MainWindowWorkSpace extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="header image">
          <div className="row">
            <div className="col s4">
              <i className="logo"></i>
            </div>
            <div className="col s8">
              <div className="white-text cryptobanner">
                <p>{lang.get_resource.About.info_about_product}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="maincontent">
          <div className="appfunction">
            <div className="row">
              <MainWindowOperation
                info={lang.get_resource.About.info_about_sign}
                title_pre={lang.get_resource.Settings.Digital}
                title_post={lang.get_resource.Sign.Signature}
                operation="sign"
              />
              <MainWindowOperation
                info={lang.get_resource.About.info_about_encrypt}
                title_pre={lang.get_resource.Encrypt.Encryption}
                title_post={lang.get_resource.Settings.Datas}
                operation="encrypt"
              />
              <MainWindowOperation
                info={lang.get_resource.About.info_about_certificate}
                title_pre={lang.get_resource.Settings.Control}
                title_post={lang.get_resource.Certificate.FCertificates}
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
