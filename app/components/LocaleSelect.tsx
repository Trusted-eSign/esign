import React from "react";
import { connect } from "react-redux";
import { changeLocale } from "../AC";
import { EN, RU } from "../constants";

class LocaleSelect extends React.Component {
  handleChange = () => {
    const { locale, changeLocale } = this.props;

    locale === RU ? changeLocale(EN) : changeLocale(RU);
    window.locale = locale === RU ? EN : RU;
  }

  render() {
    const { locale } = this.props;

    return (
      <div className="lang waves-effect waves-light">
        <a className={locale} onClick={this.handleChange}>{locale}</a>
      </div>
    );
  }
}

export default connect((state) => ({
  locale: state.settings.locale,
}), { changeLocale })(LocaleSelect);
