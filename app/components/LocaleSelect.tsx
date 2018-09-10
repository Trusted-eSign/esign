import React from "react";
import { connect } from "react-redux";
import { changeLocale } from "../AC";
import { EN, RU } from "../constants";

interface ILocaleSelectProps {
  changeLocale: (locale: string) => void;
  locale: string;
}

class LocaleSelect extends React.Component<ILocaleSelectProps, {}> {
  handleChange = () => {
    // tslint:disable-next-line:no-shadowed-variable
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
