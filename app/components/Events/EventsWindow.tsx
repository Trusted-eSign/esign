import PropTypes from "prop-types";
import React from "react";
import { EN, RU } from "../../constants";
import DatePicker from "../DatePicker";
import EventTable from "./EventTable";

interface IEventsWindowState {
  selectedFrom: Date | undefined;
  selectedTo: Date | undefined;
}

class EventsWindow extends React.Component<{}, IEventsWindowState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedFrom: undefined,
      selectedTo: undefined,
    };
  }

  render() {
    const { localize, locale } = this.context;
    const { selectedFrom, selectedTo } = this.state;

    return (
      <div className="row">
        <br />
        <div className="col s6">
          <DatePicker
            id="input_from"
            key="input_from"
            label="From"
            onSelect={this.handleFromChange}
          />
        </div>
        <div className="col s6">
          <DatePicker
            id="input_to"
            key="input_to"
            label="To"
            min={selectedFrom}
            onSelect={this.handleToChange}
          />
        </div>
        <div className="col s12">
          <EventTable />
        </div>
      </div>
    );
  }

  handleFromChange = (ev: any) => {
    if (ev && ev.select) {
      this.setState({ selectedFrom: new Date(ev.select) });
    }
  }

  handleToChange = (ev: any) => {
    if (ev && ev.select) {
      this.setState({ selectedTo: new Date(ev.select) });
    }
  }
}

export default EventsWindow;
