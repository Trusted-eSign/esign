import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Column, Table } from "react-virtualized";
import {
  loadAllDocuments, removeAllDocuments, selectDocument,
  unselectAllDocuments,
} from "../../AC/documentsActions";
import { filteredDocumentsSelector, selectedDocumentsSelector } from "../../selectors/documentsSelector";
import "../../table.global.css";
import { extFile, mapToArr } from "../../utils";
import FileIcon from "../Files/FileIcon";
import ProgressBars from "../ProgressBars";
import SortDirection from "../Sort/SortDirection";
import SortIndicator from "../Sort/SortIndicator";

type TSortDirection = "ASC" | "DESC" | undefined;

interface IDocumentsTableProps {
  documentsMap: any;
  isLoaded: boolean;
  isLoading: boolean;
  searchValue?: string;
  selectedDocuments: any;
}

interface IDocumentsTableDispatch {
  loadAllDocuments: () => void;
  removeAllDocuments: () => void;
  selectDocument: (uid: number) => void;
  unselectAllDocuments: () => void;
}

interface IDocumentsTableState {
  disableHeader: boolean;
  foundDocuments: number[];
  scrollToIndex: number;
  sortBy: string;
  sortDirection: TSortDirection;
  sortedList: any;
}

class DocumentTable extends React.Component<IDocumentsTableProps & IDocumentsTableDispatch, IDocumentsTableState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IDocumentsTableProps & IDocumentsTableDispatch) {
    super(props);

    const sortBy = "mtime";
    const sortDirection = SortDirection.DESC;
    const sortedList = this.sortList({ sortBy, sortDirection });

    this.state = {
      disableHeader: false,
      foundDocuments: [],
      scrollToIndex: 0,
      sortBy,
      sortDirection,
      sortedList,
    };
  }

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoaded, isLoading, loadAllDocuments, removeAllDocuments } = this.props;

    removeAllDocuments();

    if (!isLoading) {
      loadAllDocuments();
    }
  }

  componentDidUpdate(prevProps: IDocumentsTableProps & IDocumentsTableDispatch) {
    if (!prevProps.documentsMap.size && this.props.documentsMap && this.props.documentsMap.size ||
      (prevProps.documentsMap.size !== this.props.documentsMap.size)) {
      this.sort(this.state);
    }

    if (prevProps.searchValue !== this.props.searchValue && this.props.searchValue) {
      this.search(this.props.searchValue);
    }

    if (prevProps.searchValue && !this.props.searchValue) {
      this.setState({ foundDocuments: [] });
    }
  }

  componentWillUnmount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { unselectAllDocuments } = this.props;

    unselectAllDocuments();
  }

  render() {
    const { locale, localize } = this.context;
    const { isLoading, searchValue } = this.props;
    const { disableHeader, foundDocuments, scrollToIndex, sortBy, sortDirection, sortedList } = this.state;

    if (isLoading) {
      return <ProgressBars />;
    }

    const classDisabledNavigation = foundDocuments.length && foundDocuments.length === 1 ? "disabled" : "";

    const rowGetter = ({ index }: { index: number }) => this.getDatum(this.state.sortedList, index);

    return (
      <React.Fragment>
        <Table
          ref="Table"
          disableHeader={disableHeader}
          height={400}
          width={780}
          headerHeight={30}
          noRowsRenderer={this.noRowsRenderer}
          headerClassName={"headerColumn"}
          rowHeight={45}
          rowClassName={this.rowClassName}
          onRowClick={this.handleOnRowClick}
          onRowsRendered={this.handleOnRowsRendered}
          overscanRowCount={3}
          rowGetter={rowGetter}
          rowCount={sortedList.size}
          scrollToIndex={scrollToIndex}
          sort={this.sort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        >
          <Column
            cellRenderer={({ cellData, rowData }) => {
              return (
                <FileIcon file={{extension: extFile(rowData.filename), id: rowData.id}} key={rowData.id} />
              );
            }}
            dataKey="extname"
            disableSort={false}
            headerRenderer={this.headerRenderer}
            width={50}
            label={localize("Documents.type", locale)}
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
            dataKey="mtime"
            disableSort={false}
            headerRenderer={this.headerRenderer}
            width={150}
            label={localize("Documents.mdate", locale)}
          />
          <Column
            dataKey="filename"
            disableSort={false}
            headerRenderer={this.headerRenderer}
            width={480}
            label={localize("Documents.filename", locale)}
          />
          <Column
            cellRenderer={({ cellData, rowData }) => {
              return (
                <div className="row nobottom">
                  <div className="col s12">
                    <div className="truncate">{this.bytesToSize(cellData)}</div>
                  </div>
                </div>
              );
            }}
            dataKey="filesize"
            disableSort={false}
            headerRenderer={this.headerRenderer}
            width={100}
            label={localize("Documents.filesize", locale)}
          />
        </Table>
        {searchValue && foundDocuments.length ?
          <div className="card navigationToolbar valign-wrapper">
            <i className={"small material-icons cryptoarm-blue waves-effect " + classDisabledNavigation} onClick={this.handleScrollToFirstOfFoud}>first_page</i>
            <i className={"small material-icons cryptoarm-blue waves-effect " + classDisabledNavigation} onClick={this.handleScrollToBefore}>navigate_before</i>
            <div style={{ color: "black" }}>
              {foundDocuments.indexOf(scrollToIndex) + 1}/{foundDocuments.length}
            </div>
            <i className={"small material-icons cryptoarm-blue waves-effect " + classDisabledNavigation} onClick={this.handleScrollToNext}>navigate_next</i>
            <i className={"small material-icons cryptoarm-blue waves-effect " + classDisabledNavigation} onClick={this.handleScrollToLastOfFoud}>last_page</i>
          </div> :
          null}
      </React.Fragment>
    );
  }

  bytesToSize = (bytes: number, decimals = 2) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];

    if (bytes === 0) {
      return "n/a";
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i === 0) {
      return `${bytes} ${sizes[i]}`;
    }

    return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizes[i]}`;
  }

  handleOnRowClick = ({ rowData }: { rowData: any }) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { selectDocument } = this.props;

    selectDocument(rowData.id);
  }

  handleScrollToBefore = () => {
    const { foundDocuments, scrollToIndex } = this.state;

    if (foundDocuments.indexOf(scrollToIndex) - 1 >= 0) {
      this.scrollToRow(foundDocuments[foundDocuments.indexOf(scrollToIndex) - 1]);
    }
  }

  handleScrollToNext = () => {
    const { foundDocuments, scrollToIndex } = this.state;

    if (foundDocuments.indexOf(scrollToIndex) + 1 < foundDocuments.length) {
      this.scrollToRow(foundDocuments[foundDocuments.indexOf(scrollToIndex) + 1]);
    }
  }

  handleScrollToFirstOfFoud = () => {
    const { foundDocuments } = this.state;

    this.scrollToRow(foundDocuments[0]);
  }

  handleScrollToLastOfFoud = () => {
    const { foundDocuments } = this.state;

    this.scrollToRow(foundDocuments[foundDocuments.length - 1]);
  }

  getDatum = (list: any, index: number) => {
    const arr = mapToArr(list);

    return arr[index];
  }

  rowClassName = ({ index }: { index: number }) => {
    const { foundDocuments } = this.state;
    const { selectedDocuments } = this.props;

    if (index < 0) {
      return "headerRow";
    } else {
      let rowClassName = index % 2 === 0 ? "evenRow " : "oddRow ";

      if (selectedDocuments.includes(this.getDatum(this.state.sortedList, index))) {
        rowClassName += "selectedEvent";
      } else if (foundDocuments.indexOf(index) >= 0) {
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
    const { locale, localize } = this.context;
    const { sortedList } = this.state;

    if (!searchValue) {
      this.setState({ foundDocuments: [] });
      return;
    }

    const arr = list ? mapToArr(list) : mapToArr(sortedList);

    const foundDocuments: number[] = [];
    const search = searchValue.toLowerCase();

    arr.forEach((document: any, index: number) => {
      if (document.filename.toLowerCase().match(search)) {
        foundDocuments.push(index);
      }
    });

    if (!foundDocuments.length) {
      $(".toast-no_found_events").remove();
      Materialize.toast(localize("EventsFilters.no_found_events", locale), 2000, "toast-no_found_events");
    }

    this.scrollToRow(foundDocuments[0]);

    this.setState({ foundDocuments });
  }

  sortList = ({ sortBy, sortDirection }: { sortBy: string, sortDirection: TSortDirection }) => {
    const { documentsMap } = this.props;

    return documentsMap
      .sortBy((item: any) => item[sortBy])
      .update(
        // tslint:disable-next-line:no-shadowed-variable
        (documentsMap: any) => (sortDirection === SortDirection.DESC ? documentsMap.reverse() : documentsMap),
      );
  }

  headerRenderer = ({ dataKey, label, sortBy, sortDirection }: { dataKey?: string, label?: string, sortBy?: string, sortDirection?: TSortDirection }) => {
    return (
      <React.Fragment>
        {label}
        {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
      </React.Fragment>
    );
  }

  noRowsRenderer = () => {
    const { locale, localize } = this.context;

    return <div className={"noRows"}>{localize("EventsTable.no_rows", locale)}</div>;
  }

  scrollToRow = (index: number) => {
    this.setState({ scrollToIndex: index });
  }
}

export default connect((state) => ({
  documentsMap: filteredDocumentsSelector(state),
  isLoaded: state.documents.loaded,
  isLoading: state.documents.loading,
  selectedDocuments: selectedDocumentsSelector(state),
  signatures: state.signatures,
}), { loadAllDocuments, removeAllDocuments, selectDocument, unselectAllDocuments })(DocumentTable);
