import * as React from "react";
import { lang } from "../module/global_app";
import MainWindowWorkSpace from "./MainWindowWorkSpace";

class MainWindow extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { children } = this.props;

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
                      {lang.get_resource.About.company_name}<br />{lang.get_resource.About.copyright}
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
