import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { applyDocumentsFilters, resetDocumentsFilters } from "../../AC/documentsFiltersActions";
import {
  ALL, CERTIFICATE_GENERATION, CERTIFICATE_IMPORT, DECRYPT,
  DELETE_CERTIFICATE, DELETE_CONTAINER, ENCRYPT,
  PKCS12_IMPORT, SIGN, UNSIGN,
} from "../../constants";
import DatePicker from "../DatePicker";

interface IFilterDocumentsProps {
  applyDocumentsFilters: (filters: IDocumentsFilters) => void;
  dateFrom: Date;
  dateTo: Date;
  filename: string;
  onCancel?: () => void;
  sizeFrom: number;
  sizeTo: number;
  resetDocumentsFilters: () => void;
}

interface IDocumentsFilters {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  filename: string;
  sizeFrom: number;
  sizeTo: number;
}

const initialState = {
  dateFrom: undefined,
  dateTo: undefined,
  filename: "",
  sizeFrom: 0,
  sizeTo: 0,
};

class FilterDocuments extends React.Component<IFilterDocumentsProps, IDocumentsFilters> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IFilterDocumentsProps) {
    super(props);

    this.state = { ...initialState, dateFrom: props.dateFrom, dateTo: props.dateTo };
  }

  componentDidMount() {
    const { dateFrom, dateTo, filename, sizeFrom, sizeTo } = this.props;

    this.setState({ dateFrom, dateTo, filename, sizeFrom, sizeTo });

    $(document).ready(function () {
      $(".tooltipped").tooltip();
    });

    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { dateFrom, dateTo, filename, sizeFrom, sizeTo } = this.state;
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
                      id="filename"
                      type="text"
                      className={"validate"}
                      name="filename"
                      value={filename}
                      placeholder={localize("Documents.filename", locale)}
                      onChange={this.handleFilenameChange}
                    />
                    <label htmlFor="filename">
                      {localize("Documents.filename", locale)}
                    </label>
                  </div>
                </div>
                <div className="row nobottom">
                  <div className="col s12">
                    <p className="label-csr">
                      {localize("Documents.mdate", locale)}
                    </p>
                  </div>
                  <div className="col s6">
                    <DatePicker
                      id="input_from"
                      key="input_from"
                      label="From"
                      onClear={() => {
                        this.setState({ dateFrom: undefined });
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
                      min={dateFrom}
                      onClear={() => {
                        this.setState({ dateTo: undefined });
                      }}
                      onSelect={this.handleToChange}
                      selected={dateTo}
                    />
                  </div>
                </div>
              </div>
              <div className="col s6">
                <div className="row">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s3">
            <a className={"waves-effect waves-light btn btn_modal"} onClick={this.handleResetFilters}>{localize("Common.reset", locale)}</a>
          </div>
          <div className="col s5 offset-s4">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleApplyFilters}>{localize("Common.apply", locale)}</a>
            </div>
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
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

  handleFilenameChange = (ev: any) => {
    this.setState({ filename: ev.target.value });
  }

  handleFromChange = (ev: any) => {
    if (ev && ev.select) {
      this.setState({ dateFrom: new Date(ev.select) });
    }
  }

  handleToChange = (ev: any) => {
    if (ev && ev.select) {
      this.setState({ dateTo: new Date(ev.select) });
    }
  }

  handleApplyFilters = () => {
    this.props.applyDocumentsFilters(this.state);

    this.handelCancel();
  }

  handleResetFilters = () => {
    this.setState({ ...initialState });
    this.props.resetDocumentsFilters();
  }
}

export default connect((state) => ({
  dateFrom: state.filters.documents.dateFrom,
  dateTo: state.filters.documents.dateTo,
  filename: state.filters.documents.filename,
  sizeFrom: state.filters.documents.operationObjectOut,
  sizeTo: state.filters.documents.operations,
}), {
    applyDocumentsFilters, resetDocumentsFilters,
  })(FilterDocuments);
