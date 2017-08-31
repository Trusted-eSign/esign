import * as React from "react";
import MainWindowWorkSpace from "./MainWindowWorkSpace";

class MainWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    const { children } = this.props;
    const { localize, locale } = this.context;

    return (
      <div className="main">
        <div className="main-window">
          <div className="main-window-workspace">
            <MainWindowWorkSpace />
          </div>
          <div className="page-footer mainfooter">
            <div className="footer-copyright">
              <div className="row">
                <div className="col l3 s1"><i className="ctlogo"></i></div>
                <div className="col l3 s4">
                  <div className="copyright">
                    <div className="white-text text-lighten-3">
                      {localize("About.company_name", locale)}<br />{localize("About.copyright", locale)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainWindow;
