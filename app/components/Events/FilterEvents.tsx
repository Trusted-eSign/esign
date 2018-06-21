import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import {
  changeFilterDateFrom, changeFilterDateTo, changeFilterInObject,
  changeFilterLevel, changeFilterOperationsType, changeFilterOutObject,
  changeFilterUserName, resetEventsFilters,
} from "../../AC/filtersActions";
import {
  CERTIFICATE_GENERATION, CERTIFICATE_IMPORT, DECRYPT,
  DELETE_CERTIFICATE, DELETE_CONTAINER, ENCRYPT, SIGN,
  UNSIGN,
} from "../../constants";
import DatePicker from "../DatePicker";

interface IFilterEventsProps {
  changeFilterDateFrom: (dateFrom: Date | undefined) => void;
  changeFilterDateTo: (dateTo: Date | undefined) => void;
  changeFilterInObject: (objectIn: string) => void;
  changeFilterLevel: (level: string) => void;
  changeFilterOperationsType: (type: string, value: boolean) => void;
  changeFilterOutObject: (objectOut: string) => void;
  changeFilterUserName: (userName: string) => void;
  dateFrom: Date;
  dateTo: Date;
  onCancel?: () => void;
  operations: any;
  operationObjectIn: string;
  operationObjectOut: string;
  resetEventsFilters: () => void;
  userName: string;
}

interface IFilterEventsState {
  selectedFrom: Date | undefined;
  selectedTo: Date | undefined;
}

class FilterEvents extends React.Component<IFilterEventsProps, IFilterEventsState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IFilterEventsProps) {
    super(props);

    this.state = {
      selectedFrom: undefined,
      selectedTo: undefined,
    };
  }

  componentDidMount() {
    /* https://github.com/facebook/react/issues/3667
    * fix onChange for < select >
    */
    $(document).ready(() => {
      $("select").material_select();
    });

    $(document).ready(function () {
      $(".tooltipped").tooltip();
    });

    $(ReactDOM.findDOMNode(this.refs.operationSelect)).on("change", this.handleChangeFilterLevel);

    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { selectedFrom } = this.state;
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterDateFrom, changeFilterDateTo } = this.props;
    const { dateFrom, dateTo, operations, operationObjectIn, operationObjectOut, userName } = this.props;
    const { localize, locale } = this.context;

    return (
      <div className="filter_setting_modal">
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group">
              <div className="col s6">
                <div className="row" />
                <div className="row">
                  <div className="input-field input-field-csr col s12">
                    <input
                      id="userName"
                      type="text"
                      className={"validate"}
                      name="userName"
                      value={userName}
                      placeholder={localize("EventsFilters.write_user_name", locale)}
                      onChange={this.handleUserChange}
                    />
                    <label htmlFor="userName">
                      {localize("EventsTable.user_name", locale)}
                    </label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field input-field-csr col s12">
                    <select className="select" ref="operationSelect" value={"all"} onChange={this.handleChangeFilterLevel} >>
                      <option value={"all"}>{localize("EventsFilters.level_all", locale)}</option>
                      <option value={"info"}>{localize("EventsFilters.level_info", locale)}</option>
                      <option value={"error"}>{localize("EventsFilters.level_error", locale)}</option>
                    </select>
                    <label>{localize("EventsTable.status", locale)}</label>
                  </div>
                </div>
                <div className="row nobottom">
                  <div className="col s12">
                    <p className="label-csr">
                      {localize("EventsFilters.date", locale)}
                    </p>
                  </div>
                  <div className="col s6">
                    <DatePicker
                      id="input_from"
                      key="input_from"
                      label="From"
                      onClear={() => {
                        this.setState({ selectedFrom: undefined });
                        changeFilterDateFrom(undefined);
                      }}
                      onSelect={this.handleFromChange}
                      selected={dateFrom}
                    />
                  </div>
                  <div className="col s6">
                    <DatePicker
                      id="input_to"
                      key="input_to"
                      label="To"
                      min={selectedFrom}
                      onClear={() => changeFilterDateTo(undefined)}
                      onSelect={this.handleToChange}
                      selected={dateTo}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="input-field input-field-csr col s12">
                    <input
                      id="objectIn"
                      type="text"
                      className={"validate"}
                      name="objectIn"
                      value={operationObjectIn}
                      placeholder={localize("EventsFilters.write_object_for_filter", locale)}
                      onChange={this.handleChangeFilterInObject}
                    />
                    <label htmlFor="objectIn">
                      {localize("EventsTable.operation_object", locale)}
                    </label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field input-field-csr col s12">
                    <input
                      id="objectOut"
                      type="text"
                      className={"validate"}
                      name="objectOut"
                      value={operationObjectOut}
                      placeholder={localize("EventsFilters.write_object_for_filter", locale)}
                      onChange={this.handleChangeFilterOutObject}
                    />
                    <label htmlFor="objectOut">
                      {localize("EventsTable.operation_result", locale)}
                    </label>
                  </div>
                </div>
              </div>
              <div className="col s6">
                <div className="row">
                  <p className="label-csr">
                    {localize("EventsTable.operation", locale)}
                  </p>
                  <div className="operations_group">
                    <div className="row">
                      <div className="col s12">
                        <div className="row halfbottom" />
                        <div className="input-checkbox">
                          <input
                            name={SIGN}
                            type="checkbox"
                            id={SIGN}
                            className="filled-in"
                            checked={operations.SIGN}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={SIGN} className="truncate">
                            {localize("EventsFilters.sign", locale)}
                          </label>
                        </div>
                        <div className="input-checkbox">
                          <input
                            name={UNSIGN}
                            type="checkbox"
                            id={UNSIGN}
                            className="filled-in"
                            checked={operations.UNSIGN}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={UNSIGN} className="truncate">
                            {localize("EventsFilters.unsign", locale)}
                          </label>
                        </div>
                        <div className="input-checkbox">
                          <input
                            name={ENCRYPT}
                            type="checkbox"
                            id={ENCRYPT}
                            className="filled-in"
                            checked={operations.ENCRYPT}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={ENCRYPT} className="truncate">
                            {localize("EventsFilters.encrypt", locale)}
                          </label>
                        </div>
                        <div className="input-checkbox">
                          <input
                            name={DECRYPT}
                            type="checkbox"
                            id={DECRYPT}
                            className="filled-in"
                            checked={operations.DECRYPT}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={DECRYPT} className="truncate">
                            {localize("EventsFilters.decrypt", locale)}
                          </label>
                        </div>
                        <div className="input-checkbox">
                          <input
                            name={CERTIFICATE_GENERATION}
                            type="checkbox"
                            id={CERTIFICATE_GENERATION}
                            className="filled-in"
                            checked={operations.CERTIFICATE_GENERATION}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={CERTIFICATE_GENERATION} className="truncate">
                            {localize("EventsFilters.certificate_generation", locale)}
                          </label>
                        </div>
                        <div className="input-checkbox">
                          <input
                            name={CERTIFICATE_IMPORT}
                            type="checkbox"
                            id={CERTIFICATE_IMPORT}
                            className="filled-in"
                            checked={operations.CERTIFICATE_IMPORT}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={CERTIFICATE_IMPORT} className="truncate">
                            {localize("EventsFilters.certificate_import", locale)}
                          </label>
                        </div>
                        <div className="input-checkbox">
                          <input
                            name={DELETE_CERTIFICATE}
                            type="checkbox"
                            id={DELETE_CERTIFICATE}
                            className="filled-in"
                            checked={operations.DELETE_CERTIFICATE}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={DELETE_CERTIFICATE} className="truncate">
                            {localize("EventsFilters.delete_certificate", locale)}
                          </label>
                        </div>
                        <div className="input-checkbox">
                          <input
                            name={DELETE_CONTAINER}
                            type="checkbox"
                            id={DELETE_CONTAINER}
                            className="filled-in"
                            checked={operations.DELETE_CONTAINER}
                            onChange={this.handleOperationTypesChange}
                          />
                          <label htmlFor={DELETE_CONTAINER} className="truncate">
                            {localize("EventsFilters.delete_container", locale)}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s5 offset-s7">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleResetFilters}>{localize("Common.reset", locale)}</a>
            </div>
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.apply", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleUserChange = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterUserName } = this.props;
    changeFilterUserName(ev.target.value);
  }

  handleChangeFilterInObject = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterInObject } = this.props;
    changeFilterInObject(ev.target.value);
  }

  handleChangeFilterOutObject = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterOutObject } = this.props;
    changeFilterOutObject(ev.target.value);
  }

  handleChangeFilterLevel = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterLevel } = this.props;
    changeFilterLevel(ev.target.value);
  }

  handleFromChange = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterDateFrom } = this.props;

    if (ev && ev.select) {
      this.setState({ selectedFrom: new Date(ev.select) });
    }

    changeFilterDateFrom(new Date(ev.select));
  }

  handleToChange = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterDateTo } = this.props;

    if (ev && ev.select) {
      this.setState({ selectedTo: new Date(ev.select) });
    }

    changeFilterDateTo(new Date(ev.select));
  }

  handleOperationTypesChange = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeFilterOperationsType, operations } = this.props;
    const target = ev.target;
    const name = target.name;

    changeFilterOperationsType(name, !operations[name]);
  }

  handleResetFilters = () => {
    this.props.resetEventsFilters();

    this.handelCancel();
  }
}

export default connect((state) => ({
  dateFrom: state.filters.dateFrom,
  dateTo: state.filters.dateTo,
  operationObjectIn: state.filters.operationObjectIn,
  operationObjectOut: state.filters.operationObjectOut,
  operations: state.filters.operations,
  userName: state.filters.userName,
}), {
    changeFilterDateFrom, changeFilterDateTo, changeFilterInObject,
    changeFilterLevel, changeFilterOperationsType, changeFilterOutObject,
    changeFilterUserName, resetEventsFilters,
  })(FilterEvents);
