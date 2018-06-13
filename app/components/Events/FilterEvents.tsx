import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import DatePicker from "../DatePicker";

interface IFilterEventsState {
  selectedFrom: Date | undefined;
  selectedTo: Date | undefined;
}

class FilterEvents extends React.Component<{}, IFilterEventsState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: {}) {
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

    $(document).ready(function() {
      $(".tooltipped").tooltip();
    });

    $(ReactDOM.findDOMNode(this.refs.algorithmSelect)).on("change", () => console.log("333"));

    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  render() {
    const { selectedFrom } = this.state;

    return (
      <div className="modal-body">
        <div className="row">
          <div className="row halfbottom" />
          <div className="row">
            <div className="input-field input-field-csr col s6">
              <input
                id="userName"
                type="text"
                className={"validate"}
                name="userName"
                value={""}
                placeholder="Укажите имя пользователя"
                onChange={() => console.log("22s")}
              />
              <label htmlFor="userName">
                Пользователь
            </label>
            </div>
            <div className="input-field input-field-csr col s6">
              <select className="select" ref="operationSelect" value={"sign"} onChange={() => console.log("123")} >>
              <option value={"sign"}>{"Все"}</option>
                <option value={"encrypt"}>{"Успешно"}</option>
                <option value={"generate"}>{"Ошибка"}</option>
              </select>
              <label>Статус</label>
            </div>
          </div>
          <div className="col s6">
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
          </div>
          <div className="input-field input-field-csr col s6">
              <select className="select" ref="operationSelect" value={"sign"} onChange={() => console.log("123")} >>
              <option value={"sign"}>{"Все"}</option>
                <option value={"encrypt"}>{"Успешно"}</option>
                <option value={"generate"}>{"Ошибка"}</option>
              </select>
              <label>Выходной объект</label>
            </div>
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

export default FilterEvents;
