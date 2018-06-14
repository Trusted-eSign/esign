import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import {
  changeFilterDateFrom, changeFilterDateTo, changeFilterInObject,
  changeFilterLevel, changeFilterOutObject, changeFilterUserName,
} from "../../AC/filtersActions";
import DatePicker from "../DatePicker";

interface IFilterEventsProps {
  changeFilterDateFrom: (dateFrom: Date) => void;
  changeFilterDateTo: (dateTo: Date) => void;
  changeFilterInObject: (objectIn: string) => void;
  changeFilterLevel: (level: string) => void;
  changeFilterOutObject: (objectOut: string) => void;
  changeFilterUserName: (userName: string) => void;
  dateFrom: Date;
  dateTo: Date;
  operationObjectIn: string;
  operationObjectOut: string;
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

  render() {
    const { selectedFrom } = this.state;
    const { dateFrom, dateTo, operationObjectIn, operationObjectOut, userName } = this.props;
    const { localize, locale } = this.context;

    return (
      <div className="modal-body">
        <div className="row">
          <div className="row halfbottom" />
          <div className="col s6">
            <div className="row">
              <div className="input-field input-field-csr col s12">
                <input
                  id="userName"
                  type="text"
                  className={"validate"}
                  name="userName"
                  value={userName}
                  placeholder="Укажите имя пользователя"
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
                <option value={"all"}>{"Все"}</option>
                  <option value={"info"}>{"Успешно"}</option>
                  <option value={"error"}>{"Ошибка"}</option>
                </select>
                <label>Статус</label>
              </div>
            </div>
            <div className="row">
              <div className="col s6">
                <DatePicker
                  id="input_from"
                  key="input_from"
                  label="From"
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
                  placeholder="Укажите наименование для фильтрации"
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
                  placeholder="Укажите наименование для фильтрации"
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
            </div>
          </div>
        </div>
      </div>
    );
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
}

export default connect((state) => ({
  dateFrom: state.filters.dateFrom,
  dateTo: state.filters.dateTo,
  operationObjectIn: state.filters.operationObjectIn,
  operationObjectOut: state.filters.operationObjectOut,
  userName: state.filters.userName,
}), { changeFilterDateFrom, changeFilterDateTo, changeFilterInObject,
   changeFilterLevel, changeFilterOutObject, changeFilterUserName })(FilterEvents);
