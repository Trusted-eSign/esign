import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Column, Table } from "react-virtualized";
import { loadAllEvents } from "../../AC";
import { filteredEventsSelector } from "../../selectors/eventsSelectors";
import "../../table.global.css";
import { mapToArr } from "../../utils";
import ProgressBars from "../ProgressBars";
import SortDirection from "./SortDirection";
import SortIndicator from "./SortIndicator";

type TSortDirection = "ASC" | "DESC" | undefined;

interface IEventTableProps {
  eventsMap: any;
  isLoaded: boolean;
  isLoading: boolean;
  searchValue?: string;
}

interface IEventTableDispatch {
  loadAllEvents: () => void;
}

interface IEventTableState {
  disableHeader: boolean;
  foundEvents: number[];
  scrollToIndex: number;
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
      foundEvents: [],
      scrollToIndex: 0,
      sortBy,
      sortDirection,
      sortedList,
    };
  }

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoading, loadAllEvents } = this.props;

    if (!isLoading) {
      loadAllEvents();
    }
  }

  componentDidUpdate(prevProps: IEventTableProps & IEventTableDispatch) {
    if (!prevProps.eventsMap.size && this.props.eventsMap && this.props.eventsMap.size ||
      (prevProps.eventsMap.size !== this.props.eventsMap.size)) {
      this.sort(this.state);
    }

    if (prevProps.searchValue !== this.props.searchValue && this.props.searchValue) {
      this.search(this.props.searchValue);
    }

    if (prevProps.searchValue && !this.props.searchValue) {
      this.setState({ foundEvents: [] });
    }
  }

  render() {
    const { locale } = this.context;
    const { isLoading, searchValue } = this.props;
    const { disableHeader, foundEvents, scrollToIndex, sortBy, sortDirection, sortedList } = this.state;

    if (isLoading) {
      return <ProgressBars />;
    }

    const rowGetter = ({ index }: { index: number }) => this.getDatum(this.state.sortedList, index);

    return (
      <div>
        <Table
          ref="Table"
          disableHeader={disableHeader}
          height={475}
          width={780}
          headerHeight={30}
          noRowsRenderer={this.noRowsRenderer}
          headerClassName={"headerColumn"}
          rowHeight={45}
          rowClassName={this.rowClassName}
          overscanRowCount={5}
          rowGetter={rowGetter}
          rowCount={sortedList.size}
          scrollToIndex={scrollToIndex}
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
                month: "numeric",
                year: "numeric",
              });
            }}
            dataKey="timestamp"
            disableSort={false}
            width={130}
            label="Дата и время"
          />
          <Column
            dataKey="operation"
            disableSort={false}
            headerRenderer={this.headerRenderer}
            width={180}
            label="Операция"
          />
          <Column
            dataKey="userName"
            disableSort={false}
            headerRenderer={this.headerRenderer}
            width={120}
            label="Пользователь"
          />
          <Column
            cellRenderer={({ cellData }) => {
              return (
                <div className="row nobottom">
                  <div className="col s12">
                    <div className="truncate">{cellData.in}</div>
                    <div className="truncate" style={{ opacity: .6 }}> -> {cellData.out}</div>
                  </div>
                </div>
              );
            }}
            dataKey="operationObject"
            disableSort
            width={250}
            label="Объект операции"
          />
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
                    <div className="col s12">
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
        </Table>
        {searchValue ?
          <div className="card navigationToolbar valign-wrapper">
            <i className="small material-icons cryptoarm-blue" onClick={this.handleScrollToFirstOfFoud}>first_page</i>
            <i className="small material-icons cryptoarm-blue" onClick={this.handleScrollToBefore}>navigate_before</i>
            {foundEvents.indexOf(scrollToIndex) + 1}/{foundEvents.length}
            <i className="small material-icons cryptoarm-blue" onClick={this.handleScrollToNext}>navigate_next</i>
            <i className="small material-icons cryptoarm-blue" onClick={this.handleScrollToLastOfFoud}>last_page</i>
          </div> :
          null}
      </div>
    );
  }

  handleScrollToBefore = () => {
    const { foundEvents, scrollToIndex } = this.state;

    if (foundEvents.indexOf(scrollToIndex) - 1 >= 0) {
      this.scrollToRow(foundEvents[foundEvents.indexOf(scrollToIndex) - 1]);
    }
  }

  handleScrollToNext = () => {
    const { foundEvents, scrollToIndex } = this.state;

    if (foundEvents.indexOf(scrollToIndex) + 1 < foundEvents.length) {
      this.scrollToRow(foundEvents[foundEvents.indexOf(scrollToIndex) + 1]);
    }
  }

  handleScrollToFirstOfFoud = () => {
    const { foundEvents } = this.state;

    this.scrollToRow(foundEvents[0]);
  }

  handleScrollToLastOfFoud = () => {
    const { foundEvents } = this.state;

    this.scrollToRow(foundEvents[foundEvents.length - 1]);
  }

  getDatum = (list: any, index: number) => {
    const arr = mapToArr(list);

    return arr[index];
  }

  rowClassName = ({ index }: { index: number }) => {
    const { foundEvents } = this.state;

    if (index < 0) {
      return "headerRow";
    } else {
      let rowClassName = index % 2 === 0 ? "evenRow " : "oddRow ";

      if (foundEvents.indexOf(index) >= 0) {
        rowClassName += "foundEvent";
      }

      return rowClassName;
    }
  }

  sort = ({ sortBy, sortDirection }: { sortBy: string, sortDirection: TSortDirection }) => {
    const sortedList = this.sortList({ sortBy, sortDirection });

    this.setState({ sortBy, sortDirection, sortedList });

    this.search(this.props.searchValue, sortedList);
  }

  search = (searchValue: string | undefined, list?: any) => {
    const { sortedList } = this.state;

    if (!searchValue) {
      this.setState({ foundEvents: [] });
      return;
    }

    const arr = list ? mapToArr(list) : mapToArr(sortedList);

    const foundEvents: number[] = [];

    arr.forEach((event: any, index: number) => {
      if (event.userName.match(searchValue) ||
        event.operationObject.in.match(searchValue) ||
        event.operationObject.out.match(searchValue) ||
        event.level.match(searchValue) ||
        event.timestamp.match(searchValue)) {

        foundEvents.push(index);
      }
    });

    this.scrollToRow(foundEvents[0]);

    this.setState({ foundEvents });
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

  scrollToRow = (index: number) => {
    this.setState({ scrollToIndex: index });
  }
}

export default connect((state) => ({
  eventsMap: filteredEventsSelector(state),
  isLoaded: state.events.loaded,
  isLoading: state.events.loading,
}), { loadAllEvents })(EventTable);
