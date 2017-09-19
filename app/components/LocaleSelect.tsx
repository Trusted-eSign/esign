import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { changeLocale } from "../AC";
import { EN, RU } from "../constants";

class LocaleSelect extends Component {
  handleChange = () => {
    const { locale, changeLocale } = this.props;

    locale === RU ? changeLocale(EN) : changeLocale(RU);
  }

  render() {
    const { locale } = this.props;

    return (
      <div className="lang">
        <a className={locale} onClick={this.handleChange}>{locale}</a>
      </div>
    );
  }
}

export default connect((state) => ({
  locale: state.settings.locale,
}), { changeLocale })(LocaleSelect);
