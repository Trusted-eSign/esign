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
    const sortDirection = SortDirection.DESC;
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

    if (!isLoading) {
      loadAllEvents();
    }
  }

  componentDidUpdate(prevProps: IEventTableProps & IEventTableDispatch, prevState: IEventTableState) {
    if (!prevProps.eventsMap.size && this.props.eventsMap && this.props.eventsMap.size ||
      (prevProps.eventsMap.size !== this.props.eventsMap.size)) {
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
        width={780}
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
            let msg;
            let levelStyle;

            switch (cellData) {
              case "info":
                msg = "Успех";
                levelStyle = "icon_ok";
                break;
              case "error":
                msg = "Ошибка";
                levelStyle = "icon_fail";
                break;
            }

            return (
              <div className="row nobottom">
                <div className="valign-wrapper">
                  <div className="col s2">
                    <div className={levelStyle} />
                  </div>
                  <div className="col s10">
                    <p>{msg}</p>
                  </div>
                </div>
              </div>
            );
          }}
          dataKey="level"
          disableSort={false}
          headerRenderer={this.headerRenderer}
          width={100}
          label="Статус"
        />
        <Column
          cellRenderer={({ cellData }) => {
            return (new Date(cellData)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "numeric",
              year: "numeric",
            });
          }}
          dataKey="timestamp"
          disableSort={false}
          width={150}
          label="Дата и время"
        />
        <Column
          dataKey="operation"
          disableSort={false}
          headerRenderer={this.headerRenderer}
          width={180}
          label="Тип операции"
        />
        <Column
          dataKey="userName"
          disableSort={false}
          headerRenderer={this.headerRenderer}
          width={150}
          label="Пользователь"
        />
        <Column
          dataKey="fileName"
          disableSort
          width={200}
          label="Файл"
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

  headerRenderer = ({ dataKey, label, sortBy, sortDirection }: { dataKey?: string, label?: string, sortBy?: string, sortDirection?: TSortDirection }) => {
    return (
      <div>
        {label}
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
