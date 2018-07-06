import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { changeLocation, filePackageSelect, removeAllFiles, removeAllRemoteFiles } from "../../AC";
import { loadAllDocuments, removeAllDocuments } from "../../AC/documentsActions";
import {
  DECRYPT, DEFAULT_DOCUMENTS_PATH, ENCRYPT,
  LOCATION_ENCRYPT, LOCATION_SIGN, SIGN, VERIFY,
} from "../../constants";
import { selectedDocumentsSelector } from "../../selectors/documentsSelector";
import Modal from "../Modal";
import DocumentsTable from "./DocumentsTable";
import FilterDocuments from "./FilterDocuments";

interface IDocumentsWindowProps {
  documents: any;
  documentsLoaded: boolean;
  documentsLoading: boolean;
  isDefaultFilters: boolean;
  changeLocation: (locaion: string) => void;
  loadAllDocuments: () => void;
  filePackageSelect: (files: string[]) => void;
  removeAllDocuments: () => void;
  removeAllFiles: () => void;
  removeAllRemoteFiles: () => void;
}

interface IDocumentsWindowState {
  searchValue: string;
  showModalFilterDocments: boolean;
}

class DocumentsWindow extends React.Component<IDocumentsWindowProps, IDocumentsWindowState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IDocumentsWindowProps) {
    super(props);

    this.state = {
      searchValue: "",
      showModalFilterDocments: false,
    };
  }

  componentDidMount() {
    $(".nav-small-btn").dropdown({
      alignment: "left",
      belowOrigin: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });

    $(document).ready(function() {
      $(".tooltipped").tooltip();
    });
  }

  componentWillUnmount() {
    $(".tooltipped").tooltip("remove");
  }

  render() {
    const { localize, locale } = this.context;
    const { documents, isDefaultFilters } = this.props;

    const classDefaultFilters = isDefaultFilters ? "filter_off" : "filter_on";
    const disabledClass = documents.length ? "" : "disabled_docs";

    return (
      <div className="row">
        <div className="row halfbottom" />

        <div className="col s10">
          <div className="input-field input-field-csr col s12 border_element find_box">
            <i className="material-icons prefix">search</i>
            <input
              id="search"
              type="search"
              placeholder={localize("EventsTable.search_in_doclist", locale)}
              value={this.state.searchValue}
              onChange={this.handleSearchValueChange} />
            <i className="material-icons close" onClick={() => this.setState({ searchValue: "" })} style={this.state.searchValue ? { color: "#444" } : {}}>close</i>
          </div>
        </div>
        <div className="col s1">
          <a className={"btn-small waves-effect waves-light"} onClick={this.handleShowModalFilterDocuments}>
            <i className={"material-icons " + classDefaultFilters}>filter_list</i>
          </a>
        </div>
        <div className="col s1">
          <a className={"nav-small-btn waves-effect waves-light"} data-activates="dropdown-btn-for-documents" style={{ margin: 0 }}>
            <i className="nav-small-icon material-icons context_menu">more_vert</i>
          </a>
          <ul id="dropdown-btn-for-documents" className="dropdown-content">
            <li><a onClick={this.handleReloadDocuments}>{localize("Common.update", locale)}</a></li>
            <li><a onClick={() => console.log("selected_all")}>{localize("Documents.selected_all", locale)}</a></li>
            <li><a onClick={this.handleOpenDocumentsFolder}>{localize("Documents.go_to_documents_folder", locale)}</a></li>
          </ul>
        </div>
        <div className="col s12">
          <div className="row">
            <div className="col s10prt">
            <a  className={`waves-effect waves-light  ${disabledClass}`}
                data-position="bottom"
                onClick={this.handleClickSign}>
              <div className="row docmenu"><i className="material-icons docmenu_sign"></i></div>
              <div className="row docmenu">{localize("Documents.docmenu_sign", locale)}</div>
            </a>
            </div>
            <div className="col s10prt">
            <a  className={`waves-effect waves-light  ${disabledClass}`}
                data-position="bottom"
                data-tooltip={localize("Sign.sign_and_verify", locale)}
                onClick={this.handleClickSign}>
              <div className="row docmenu"><i className="material-icons docmenu_verifysign"></i></div>
              <div className="row docmenu">{localize("Documents.docmenu_verifysign", locale)}</div>
            </a>
            </div>
            <div className="col s10prt">
            <a  className={`waves-effect waves-light ${disabledClass}`} data-position="bottom"
                onClick={this.handleClickSign}>
              <div className="row docmenu"><i className="material-icons docmenu_removesign"></i></div>
              <div className="row docmenu">{localize("Documents.docmenu_removesign", locale)}</div>
            </a>
            </div>
            <div className="col s10prt">
              <a className={`waves-effect waves-light ${disabledClass}`}
                data-position="bottom" onClick={this.handleClickEncrypt}>
              <div className="row docmenu"><i className="material-icons docmenu_encrypt"></i></div>
              <div className="row docmenu">{localize("Documents.docmenu_enctypt", locale)}</div>
              </a>
            </div>
            <div className="col s10prt">
              <a className={`waves-effect waves-light ${disabledClass}`} data-position="bottom"
                onClick={this.handleClickEncrypt} >
              <div className="row docmenu"><i className="material-icons docmenu_decrypt"></i></div>
              <div className="row docmenu">{localize("Documents.docmenu_dectypt", locale)}</div>
              </a>
            </div>
            <div className="col s10prt">
              <a className={`waves-effect waves-light ${disabledClass}`} data-position="bottom">
              <div className="row docmenu"><i className="material-icons docmenu_arhiver"></i></div>
              <div className="row docmenu">{localize("Documents.docmenu_arhiver", locale)}</div>  
              </a>
            </div>
            <div className="col s1">
              <a className={`waves-effect waves-light ${disabledClass}`} data-position="bottom"
                onClick={this.handleClickDelete} >
              <div className="row docmenu"><i className="material-icons docmenu_remove"></i></div>
              <div className="row docmenu">{localize("Documents.docmenu_remove", locale)}</div> 
              </a>
            </div>
          </div>
        </div>
        <div className="col s12">
          <DocumentsTable searchValue={this.state.searchValue} />
        </div>
        {this.showModalFilterDocuments()}
      </div>
    );
  }

  showModalFilterDocuments = () => {
    const { localize, locale } = this.context;
    const { showModalFilterDocments } = this.state;

    if (!showModalFilterDocments) {
      return;
    }

    return (
      <Modal
        isOpen={showModalFilterDocments}
        header={localize("Filters.filters_settings", locale)}
        onClose={this.handleCloseModalFilterDocuments}>

        <FilterDocuments onCancel={this.handleCloseModalFilterDocuments} />
      </Modal>
    );
  }

  handleClickSign = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { documents, filePackageSelect, removeAllFiles, removeAllRemoteFiles } = this.props;

    removeAllFiles();
    removeAllRemoteFiles();
    filePackageSelect(documents);
    this.openWindow(SIGN);
  }

  handleClickEncrypt = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { documents, filePackageSelect, removeAllFiles, removeAllRemoteFiles } = this.props;

    removeAllFiles();
    removeAllRemoteFiles();
    filePackageSelect(documents);
    this.openWindow(ENCRYPT);
  }

  handleClickDelete = () => {
    console.log("--- delete");
  }

  openWindow = (operation: string) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeLocation } = this.props;

    switch (operation) {
      case SIGN:
      case VERIFY:
        changeLocation(LOCATION_SIGN);
        return;

      case ENCRYPT:
      case DECRYPT:
        changeLocation(LOCATION_ENCRYPT);
        return;

      default:
        return;
    }
  }

  handleSearchValueChange = (ev: any) => {
    this.setState({ searchValue: ev.target.value });
  }

  handleShowModalFilterDocuments = () => {
    this.setState({ showModalFilterDocments: true });
  }

  handleCloseModalFilterDocuments = () => {
    this.setState({ showModalFilterDocments: false });
  }

  handleReloadDocuments = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { documentsLoading, loadAllDocuments, removeAllDocuments } = this.props;

    removeAllDocuments();

    if (!documentsLoading) {
      loadAllDocuments();
    }
  }

  handleOpenDocumentsFolder = () => {
    window.electron.shell.openItem(DEFAULT_DOCUMENTS_PATH);
  }
}

export default connect((state) => ({
  documents: selectedDocumentsSelector(state),
  documentsLoaded: state.events.loaded,
  documentsLoading: state.events.loading,
  isDefaultFilters: state.filters.documents.isDefaultFilters,
}), { changeLocation, loadAllDocuments, filePackageSelect, removeAllDocuments, removeAllFiles, removeAllRemoteFiles })(DocumentsWindow);
