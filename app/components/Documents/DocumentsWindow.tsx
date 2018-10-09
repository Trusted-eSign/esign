import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { changeLocation, filePackageSelect, removeAllFiles, removeAllRemoteFiles } from "../../AC";
import {
  arhiveDocuments, loadAllDocuments, removeAllDocuments,
  removeDocuments, selectAllDocuments, selectDocument,
} from "../../AC/documentsActions";
import {
  DECRYPT, DEFAULT_DOCUMENTS_PATH, ENCRYPT,
  LOCATION_ENCRYPT, LOCATION_SIGN, SIGN,
  UNSIGN, VERIFY,
} from "../../constants";
import { selectedDocumentsSelector } from "../../selectors/documentsSelector";
import Modal from "../Modal";
import DeleteDocuments from "./DeleteDocuments";
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
  selectAllDocuments: () => void;
  selectDocument: (uid: number) => void;
  removeDocuments: (documents: any) => void;
  arhiveDocuments: (documents: any, arhiveName: string) => void;
}

interface IDocumentsWindowState {
  searchValue: string;
  showModalDeleteDocuments: boolean;
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
      showModalDeleteDocuments: false,
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
      <div className="content">
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
              <li><a onClick={this.handleSelectAllDocuments}>{localize("Documents.selected_all", locale)}</a></li>
              <li><a onClick={this.handleOpenDocumentsFolder}>{localize("Documents.go_to_documents_folder", locale)}</a></li>
            </ul>
          </div>
          <div className="col s12">
            <div className="row halfbottom">
              <div className="col s10prt">
                <a className={`waves-effect waves-light  ${this.checkEnableOperationButton(SIGN) ? "" : "disabled_docs"}`}
                  data-position="bottom"
                  onClick={this.handleClickSign}>
                  <div className="row docmenu"><i className="material-icons docmenu_sign"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_sign", locale)}</div>
                </a>
              </div>
              <div className="col s10prt">
                <a className={`waves-effect waves-light  ${this.checkEnableOperationButton(VERIFY) ? "" : "disabled_docs"}`}
                  data-position="bottom"
                  data-tooltip={localize("Sign.sign_and_verify", locale)}
                  onClick={this.handleClickSign}>
                  <div className="row docmenu"><i className="material-icons docmenu_verifysign"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_verifysign", locale)}</div>
                </a>
              </div>
              <div className="col s10prt">
                <a className={`waves-effect waves-light ${this.checkEnableOperationButton(UNSIGN) ? "" : "disabled_docs"}`} data-position="bottom"
                  onClick={this.handleClickSign}>
                  <div className="row docmenu"><i className="material-icons docmenu_removesign"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_removesign", locale)}</div>
                </a>
              </div>
              <div className="col s10prt">
                <a className={`waves-effect waves-light ${this.checkEnableOperationButton(ENCRYPT) ? "" : "disabled_docs"}`}
                  data-position="bottom" onClick={this.handleClickEncrypt}>
                  <div className="row docmenu"><i className="material-icons docmenu_encrypt"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_enctypt", locale)}</div>
                </a>
              </div>
              <div className="col s10prt">
                <a className={`waves-effect waves-light ${this.checkEnableOperationButton(DECRYPT) ? "" : "disabled_docs"}`} data-position="bottom"
                  onClick={this.handleClickEncrypt} >
                  <div className="row docmenu"><i className="material-icons docmenu_decrypt"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_dectypt", locale)}</div>
                </a>
              </div>
              <div className="col s10prt">
                <a className={`waves-effect waves-light ${disabledClass}`} data-position="bottom"
                  onClick={this.handleArhiveDocuments} >
                  <div className="row docmenu"><i className="material-icons docmenu_arhiver"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_arhiver", locale)}</div>
                </a>
              </div>
              <div className="col s1">
                <a className={`waves-effect waves-light ${disabledClass}`} data-position="bottom"
                  onClick={this.handleShowModalDeleteDocuments} >
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
          {this.showModalDeleteDocuments()}
        </div>
      </div>
    );
  }

  checkEnableOperationButton = (operation: string) => {
    const { documents } = this.props;

    if (!documents.length) {
      return false;
    }

    switch (operation) {
      case SIGN:
        for (const document of documents) {
          if (document.extname === ".enc") {
            return false;
          }
        }

        return true;

      case VERIFY:
      case UNSIGN:
        for (const document of documents) {
          if (document.extname !== ".sig") {
            return false;
          }
        }

        return true;

      case ENCRYPT:
        for (const document of documents) {
          if (document.extname === ".enc") {
            return false;
          }
        }

        return true;

      case DECRYPT:
        for (const document of documents) {
          if (document.extname !== ".enc") {
            return false;
          }
        }

        return true;

      default:
        return false;
    }
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

  showModalDeleteDocuments = () => {
    const { localize, locale } = this.context;
    const { documents } = this.props;
    const { showModalDeleteDocuments } = this.state;

    if (!documents || !showModalDeleteDocuments) {
      return;
    }

    return (
      <Modal
        isOpen={showModalDeleteDocuments}
        header={localize("Documents.delete_documents", locale)}
        onClose={this.handleCloseModalDeleteDocuments}>

        <DeleteDocuments
          onCancel={this.handleCloseModalDeleteDocuments}
          removeDocuments={this.handleClickDelete} />
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
    const { localize, locale } = this.context;
    const { documents } = this.props;
    const count = documents.length;

    removeDocuments(documents);
    this.handleReloadDocuments();

    const message = localize("Documents.documents_deleted1", locale) + count + localize("Documents.documents_deleted2", locale);
    Materialize.toast(message, 2000, "toast-remove_documents");

    this.handleCloseModalDeleteDocuments();
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

  handleShowModalDeleteDocuments = () => {
    this.setState({ showModalDeleteDocuments: true });
  }

  handleCloseModalDeleteDocuments = () => {
    this.setState({ showModalDeleteDocuments: false });
  }

  handleReloadDocuments = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { documentsLoading, loadAllDocuments, removeAllDocuments } = this.props;
    removeAllDocuments();
    if (!documentsLoading) {
      loadAllDocuments();
    }
  }

  handleArhiveDocuments = () => {
    const { localize, locale } = this.context;
    const { documents } = this.props;
    let arhiveName: string = "";

    const date = new Date();
    // tslint:disable-next-line:quotemark
    // tslint:disable-next-line:max-line-length
    const dateNow = ("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear() + "_" + ("0" + date.getHours()).slice(-2) + "." + ("0" + date.getMinutes()).slice(-2) + "." + ("0" + date.getSeconds()).slice(-2);
    arhiveName = "arhive_" + dateNow + ".zip";
    arhiveDocuments(documents, arhiveName);
    this.handleReloadDocuments();
    const message = localize("Documents.documents_arhive", locale) + arhiveName;
    Materialize.toast(message, 2000, "toast-arhive_documents");
  }

  handleSelectAllDocuments = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { selectAllDocuments } = this.props;

    selectAllDocuments();
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
}), {
    arhiveDocuments, changeLocation, filePackageSelect, loadAllDocuments,
    removeAllDocuments, removeAllFiles, removeAllRemoteFiles, removeDocuments,
    selectAllDocuments, selectDocument,
  })(DocumentsWindow);
