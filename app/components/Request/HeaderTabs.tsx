import PropTypes from "prop-types";
import React from "react";

interface IHeaderTabsProps {
  activeSubjectNameInfoTab: (active: boolean) => void;
}

class HeaderTabs extends React.Component<IHeaderTabsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    $(document).ready(() => {
      $("ul.tabs").tabs();
    });

    $(document).ready(() => {
      $("ul.tabs").tabs("select_tab", "tab_id");
    });
  }

  render() {
    const { localize, locale } = this.context;
    const { activeSubjectNameInfoTab } = this.props;

    return (
      <div className="row halfbottom">
        <ul id="tabs-swipe-demo" className="tabs">
          <li className="tab col s6">
            <a className="header-tab active" onClick={() => activeSubjectNameInfoTab(true)}>
              {localize("CSR.subject_params", locale)}
            </a>
          </li>
          <li className="tab col s6">
            <a className="header-tab" onClick={() => activeSubjectNameInfoTab(false)}>
              {localize("CSR.keys_params", locale)}
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default HeaderTabs;
