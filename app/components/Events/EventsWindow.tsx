import PropTypes from "prop-types";
import React from "react";
import SearchElement from "../../Filters/SearchElement";
import Modal from "../Modal";
import EventTable from "./EventTable";
import FilterEvents from "./FilterEvents";

interface IEventsWindowState {
  showModalFilterEvents: boolean;
}

class EventsWindow extends React.Component<{}, IEventsWindowState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: {}) {
    super(props);

    this.state = {
      showModalFilterEvents: false,
    };
  }

  componentDidMount() {
    $(".nav-small-btn, .file-setting-item").dropdown({
      alignment: "left",
      belowOrigin: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });
  }

  render() {
    return (
      <div className="row">
        <div className="row halfbottom" />
        {/* <nav className="app-bar-content">
          <ul className="app-bar-items">
            <li className="right">
              <a className={"nav-small-btn waves-effect waves-light "} data-activates="dropdown-btn-set-cert-2">
                <i className="material-icons right">arrow_drop_down</i>
              </a>
              <ul id="dropdown-btn-set-cert-2" className="dropdown-content">
                <li><a onClick={() => console.log("+++ 1")}>Фильтрация</a></li>
                <li><a onClick={() => console.log("+++ 1")}>Архивация</a></li>
              </ul>
            </li>
          </ul>
        </nav> */}

        <div className="col s10">
          <SearchElement />
        </div>
        <div className="col s2">
          <a className={"btn-floating btn-small waves-effect waves-light grey"} onClick={this.handleShowModalFilterEvents}>
            <i className="material-icons">filter_list</i>
          </a>
        </div>
        <div className="col s12">
          <EventTable />
        </div>
        {this.showModalCertificateRequest()}
      </div>
    );
  }

  showModalCertificateRequest = () => {
    const { localize, locale } = this.context;
    const { showModalFilterEvents } = this.state;

    if (!showModalFilterEvents) {
      return;
    }

    return (
      <Modal
        isOpen={showModalFilterEvents}
        header={localize("Filters.filters_settings", locale)}
        onClose={this.handleCloseModalFilterEvents}>

        <FilterEvents />
      </Modal>
    );
  }

  handleShowModalFilterEvents = () => {
    this.setState({ showModalFilterEvents: true });
  }

  handleCloseModalFilterEvents = () => {
    this.setState({ showModalFilterEvents: false });
  }
}

export default EventsWindow;
