import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Column, Table } from "react-virtualized";
import { loadAllEvents } from "../../AC";
import "../../table.global.css";
import { mapToArr } from "../../utils";
import ProgressBars from "../ProgressBars";
import SortDirection from "./SortDirection";
import SortIndicator from "./SortIndicator";

type TSortDirection = "ASC" | "DESC" | undefined;

interface IEvent {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
}

interface IEventTableProps {
  events: IEvent[];
  eventsMap: any;
  isLoaded: boolean;
  isLoading: boolean;
}

interface IEventTableDispatch {
  loadAllEvents: () => void;
}

interface IEventTableState {
  disableHeader: boolean;
  sortBy: string;
  sortDirection: TSortDirection;
  sortedList: any;
}

class EventTable extends React.Component<IEventTableProps & IEventTableDispatch, IEventTableState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IEventTableProps & IEventTableDispatch) {
    super(props);

    const sortBy = "timestamp";
    const sortDirection = SortDirection.ASC;
    const sortedList = this.sortList({ sortBy, sortDirection });

    this.state = {
      disableHeader: false,
      sortBy,
      sortDirection,
      sortedList,
    };
  }

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoaded, isLoading, loadAllEvents } = this.props;

    if (!isLoaded && !isLoading) {
      loadAllEvents();
    }
  }

  componentDidUpdate(prevProps: IEventTableProps & IEventTableDispatch, prevState: IEventTableState) {
    if (!prevProps.eventsMap.size && this.props.eventsMap && this.props.eventsMap.size) {
      this.sort(this.state);
    }
  }

  render() {
    const { localize, locale } = this.context;
    const { events, isLoaded, isLoading } = this.props;
    const { disableHeader, sortBy, sortDirection, sortedList } = this.state;

    if (isLoading) {
      return <ProgressBars />;
    }

    const rowGetter = ({ index }: { index: number }) => this.getDatum(this.state.sortedList, index);

    return (
      <Table
        ref="Table"
        disableHeader={disableHeader}
        height={500}
        width={750}
        headerHeight={30}
        noRowsRenderer={this.noRowsRenderer}
        headerClassName={"headerColumn"}
        rowHeight={40}
        rowClassName={this.rowClassName}
        overscanRowCount={5}
        rowGetter={rowGetter}
        rowCount={sortedList.size}
        sort={this.sort}
        sortBy={sortBy}
        sortDirection={sortDirection}
      >
        <Column
          cellRenderer={({ cellData }) => {
            return (new Date(cellData)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "long",
              year: "numeric",
            });
          }}
          dataKey="timestamp"
          disableSort={false}
          width={250}
          label="время"
        />
        <Column
          dataKey="level"
          disableSort={false}
          headerRenderer={this.headerRenderer}
          width={100}
          label="тип"
        />
        <Column
          dataKey="message"
          disableSort
          width={400}
          label="сообщение"
          className={"exampleColumn"}
        />
      </Table>
    );
  }

  getDatum = (list: any, index: number) => {
    const arr = mapToArr(list);

    return arr[index];
  }

  rowClassName = ({ index }: { index: number }) => {
    if (index < 0) {
      return "headerRow";
    } else {
      return index % 2 === 0 ? "evenRow" : "oddRow";
    }
  }

  sort = ({ sortBy, sortDirection }: { sortBy: string, sortDirection: TSortDirection }) => {
    const sortedList = this.sortList({ sortBy, sortDirection });

    this.setState({ sortBy, sortDirection, sortedList });
  }

  sortList = ({ sortBy, sortDirection }: { sortBy: string, sortDirection: TSortDirection }) => {
    const { eventsMap } = this.props;

    return eventsMap
      .sortBy((item: any) => item[sortBy])
      .update(
        // tslint:disable-next-line:no-shadowed-variable
        (eventsMap: any) => (sortDirection === SortDirection.DESC ? eventsMap.reverse() : eventsMap),
    );
  }

  headerRenderer = ({ dataKey, sortBy, sortDirection }: { dataKey?: string, sortBy?: string, sortDirection?: TSortDirection }) => {
    return (
      <div>
        тип
        {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
      </div>
    );
  }

  noRowsRenderer = () => {
    return <div className={"noRows"}>No rows</div>;
  }
}

export default connect((state, props) => ({
  events: mapToArr(state.events.entities),
  eventsMap: state.events.entities,
  isLoaded: state.events.loaded,
  isLoading: state.events.loading,
}), { loadAllEvents })(EventTable);
