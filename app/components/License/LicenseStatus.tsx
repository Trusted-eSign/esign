import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { loadLicense, verifyLicense } from "../../AC";
import * as jwt from "../../trusted/jwt";
import LicenseInfoField from "./LicenseInfoField";

interface ILicenseModel {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  sub: string;
}

interface ILicenseStatusProps {
  data: string;
  license: ILicenseModel;
  loaded: boolean;
  loading: boolean;
  status: number;
  loadLicense: () => void;
  verifyLicense: (key: string) => void;
}

class LicenseStatus extends React.Component<ILicenseStatusProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ILicenseStatusProps) {
    super(props);
  }

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { loadLicense, verifyLicense } = this.props;
    const { data, loaded, loading } = this.props;

    if (!loaded && !loading) {
      loadLicense();
    }

    verifyLicense(data);
  }

  getInfoText(): string {
    const { localize, locale } = this.context;
    const { license, status } = this.props;

    const dateExp = new Date(license.exp * 1000).getTime();
    const dateNow = new Date().getTime();
    const dateDif = dateExp - dateNow;
    const fullDays = Math.round(dateDif / (24 * 3600 * 1000));
    const unlimited: boolean = (new Date(dateExp)).getFullYear() === 2038;

    let message;

    switch (status) {
      case 0:
        message =  localize("License.lic_key_correct", locale) + fullDays + ")";
        break;

      default:
        message =  localize(jwt.getErrorMessage(status), locale);
    }

    return unlimited ? localize("License.lic_unlimited", locale) : message;
  }

  render() {
    const { localize, locale } = this.context;
    const { license, status } = this.props;

    const settings = {
      draggable: false,
    };

    let style: any;
    let styleRow: any;

    if (status !== 0) {
      style = { color: "red" };
      styleRow = { border: "2px solid red", padding: "5px" };
    } else {
      style = { color: "green" };
      styleRow = { border: "2px solid green", padding: "5px" };
    }

    return (
      <div>
        <LicenseInfoField title={localize("License.lic_status", locale)} info={this.getInfoText()} style={style} styleRow={styleRow} />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    data: state.license.data,
    license: state.license.info,
    loaded: state.license.loaded,
    loading: state.license.loading,
    status: state.license.status,
  };
}, {loadLicense, verifyLicense}, null, {pure: false})(LicenseStatus);
