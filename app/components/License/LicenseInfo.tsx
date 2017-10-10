import * as React from "react";
import { lic, License } from "../../module/license";
import LicenseInfoFiled from "./LicenseInfoField";

class LicenseInfo extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.change = this.change.bind(this);
  }

  componentDidMount() {
    lic.on(License.CHANGE, this.change);
  }

  componentWillUnmount() {
    lic.removeListener(License.CHANGE, this.change);
  }

  change() {
    this.setState({});
  }

  getLocaleDate = (time: number) => {
    const { localize, locale } = this.context;

    return new Date(time).toLocaleDateString(locale, {
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      month: "long",
      second: "numeric",
      year: "numeric",
    });
  }

  render() {
    const { localize, locale } = this.context;
    const style = { height: 39 + "px" };

    let notAfter: string;
    let notBefore: string;
    let productName: string;

    if (lic.getInfo.exp === "-") {
      notAfter = "-";
    } else {
      const exp = new Date(lic.getInfo.exp * 1000);

      notAfter = exp.getFullYear() === 2038 ? localize("License.lic_unlimited", locale) : this.getLocaleDate(lic.getInfo.exp * 1000);
    }

    if (lic.getInfo.iat === "-") {
      notBefore = "-";
    } else {
      notBefore = this.getLocaleDate(lic.getInfo.iat * 1000);
    }

    if (lic.getInfo.sub === "Trusted eSign") {
      productName = localize("About.product_name", locale);
    } else {
      productName = "-";
    }

    return (
      <div>
        <div className="bmark_desktoplic">{localize("License.About_License", locale)}</div>
        <div className="row leftshifter">
          <LicenseInfoFiled title={localize("Certificate.issuer_name", locale)} info={lic.getInfo.iss} />
          <LicenseInfoFiled title={localize("Common.subject", locale)} info={lic.getInfo.aud} />
        </div>
        <div className="row leftshifter">
          <LicenseInfoFiled title={localize("Common.product", locale)} info={productName} />
          <LicenseInfoFiled title={localize("License.lic_notbefore", locale)} info={notBefore} />
        </div>
        <div className="row leftshifter">
          <LicenseInfoFiled title="" info="" style={style} />
          <LicenseInfoFiled title={localize("License.lic_notafter", locale)} info={notAfter} />
        </div>
      </div>
    );
  }
}

export default LicenseInfo;
