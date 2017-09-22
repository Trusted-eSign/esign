import * as React from "react";

const tabHeaderStyle = {
  "font-size": "55%",
};

interface ICertificateInfoTabsProps {
  onActiveTab: (ev: any) => void;
}

class CertificateInfoTabs extends React.Component<ICertificateInfoTabsProps, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: ICertificateInfoTabsProps) {
    super(props);
  }

  componentDidMount() {
    $(document).ready(function() {
      $("ul.tabs").tabs();
    });

    $(document).ready(function() {
      $("ul.tabs").tabs("select_tab", "tab_id");
    });
  }

  render() {
    const { localize, locale } = this.context;
    const { onActiveTab } = this.props;

    return (
      <div className="row">
        <ul id="tabs-swipe-demo" className="tabs">
          <li className="tab col s6">
            <a className="cert-info active" onClick={onActiveTab} style={tabHeaderStyle}>
              {localize("Certificate.cert_info", locale)}
            </a>
          </li>
          <li className="tab col s6">
            <a className="cert-info" onClick={onActiveTab} style={tabHeaderStyle}>
              {localize("Certificate.cert_chain", locale)}
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default CertificateInfoTabs;
