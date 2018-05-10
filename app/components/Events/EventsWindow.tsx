import React from "react";
import EventTable from "./EventTable";

class EventsWindow extends React.Component<{}, {}> {
  render() {
    return (
      <div className="row">
        <div className="col s12">
          <br />
          <EventTable />
        </div>
      </div>
    );
  }
}

export default EventsWindow;
