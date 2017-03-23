import * as React from "react";
import * as native from "../native";
import { Link } from "react-router";
import { application } from "./certificate";
import { sign, SignApp } from "../module/sign_app";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { certs_app, CertificatesApp } from "../module/certificates_app";
import { extFile, lang, SETTINGS_JSON, dlg, DialogBox } from "../module/global_app";
import { ItemBar, ItemBarWithBtn } from "./elements";
import { getLicensePath, lic, licenseParse, getStatus } from "../module/license";
declare let $: any;
declare let mainWindow: any;
interface IFileComponentsProps {
    operation: string;
}
export interface IFiles extends File {
    path: string;
}

const dialog = window.electron.remote.dialog;

export class FileComponents extends React.Component<IFileComponentsProps, any> {

    constructor(props: IFileComponentsProps) {
        super(props);
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files
        this.state = { key: files.length };
        this.filesChange = this.filesChange.bind(this);
        this.archiveFiles = this.archiveFiles.bind(this);
    }
    componentDidMount() {
        $(".nav-small-btn, .file-setting-item").dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 0,
            belowOrigin: false,
            alignment: "left"
        }
        );
        sign.on(SignApp.FILES_CHANGE, this.filesChange);
        encrypt.on(EncryptApp.FILES_CHANGE, this.filesChange);
        application.on("encrypt_archive", this.archiveFiles);
    }
    componentWillUnmount() {
        application.removeListener("encrypt_archive", this.archiveFiles);
        sign.removeListener(SignApp.FILES_CHANGE, this.filesChange);
        encrypt.removeListener(EncryptApp.FILES_CHANGE, this.filesChange);
    }
    archiveFiles(uri: string, date: any) {
        let files = encrypt.get_files;
        let size = files.length;
        let files_for_encrypt = encrypt.get_files_for_encrypt;
        let all_files: any = [];
        let file_date = date;
        let file_name = native.path.basename(uri);
        let file_type = extFile(file_name);
        all_files.push({ name: file_name, path: uri, size: 0, date: file_date, key: 0, active: true, ext: file_type, verify_status: "default_status" });
        for (let i = 0; i < files_for_encrypt.length; i++) {
            files.splice(files_for_encrypt[i].key, 1);
            if (files_for_encrypt[i].key !== size - 1) {
                for (let j = files_for_encrypt[i].key; j < size - 1; j++) {
                    files[j].key = j;
                }
            }
            size--;
        }
        for (let i: number = 0; i < files.length; i++) {
            files[i].key += 1;
            all_files.push(files[i]);
        }
        encrypt.set_files = all_files;
        this.chooseFiles();
    }
    filesChange() {
        this.setState({});
    }
    chooseFiles() {
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        let choose_files: any = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].active) {
                choose_files.push(files[i])
            }
        }
        let info = this.props.operation === "sign" ? sign.set_files_for_sign = choose_files : encrypt.set_files_for_encrypt = choose_files;
        if (this.props.operation === "sign") {
            if (info.length === 1 && info[0].verify_status !== "default_status" && info[0].active) {
                let sing_info = sign.get_sign_info;
                let i = 0;
                while (sing_info[i].path !== info[0].path && i < sing_info.length) {
                    i++;
                }
                sign.set_sign_info_active = sing_info[i];
            } else {
                sign.set_sign_info_active = null;
                sign.set_sign_certs_info = null;
            }
        }
    }
    viewFiles(event: any) {
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        let newArray = files.slice(0);
        let size = files.length;
        let countDifference = 0;
        for (let i: number = 0, len: number = event.length; i < len; i++) {
            let file = event[i];
            let file_date = file.lastModifiedDate;
            let file_name = native.path.basename(file.name);
            let file_type = extFile(file_name);
            if (newArray.length > 0) {
                for (let j = 0; j < newArray.length; j++) {
                    if (newArray[j].path !== file.path) {
                        countDifference++;
                    }
                }
                if (countDifference === newArray.length) {
                    newArray.push({ name: file_name, path: file.path, size: file.size, date: file_date, key: size, active: true, ext: file_type, verify_status: "default_status" });
                    size++;
                    countDifference = 0;
                }
                else {
                    countDifference = 0;
                }
            }
            else {
                newArray.push({ name: file_name, path: file.path, size: file.size, date: file_date, key: size, active: true, ext: file_type, verify_status: "default_status" });
                size++;
            }
        }
        if (event.length !== 0) {
            this.props.operation === "sign" ? sign.set_files = newArray : encrypt.set_files = newArray;
            this.chooseFiles();
        }
    }
    addFiles() {
        if (!window.framework_NW) {
            let files: any = [];
            let self = this;
            dialog.showOpenDialog(null, { properties: ["openFile", "multiSelections"] }, function (file: any) {
                if (file) {
                    for (let i = 0; i < file.length; i++) {
                        let stat = native.fs.statSync(file[i]);
                        files.push({ name: native.path.basename(file[i]), size: stat.size, path: file[i], lastModifiedDate: stat.birthtime });
                    }
                    self.dropFiles(files);
                }
            });
        } else {
            let clickEvent = document.createEvent("MouseEvents");
            clickEvent.initEvent("click", true, true);
            document.querySelector("#choose-file").dispatchEvent(clickEvent);
        }
    }
    dragLeaveHandler(event: any) {
        event.target.classList.remove("draggedOver");
        document.querySelector("#droppableZone").classList.remove("droppableZone-active");
    }

    dragEnterHandler(event: any) {
        event.target.classList.add("draggedOver");
    }

    dragOverHandler(event: any) {
        event.stopPropagation();
        event.preventDefault();
    }

    dropFiles(files: IFiles[]) {
        let files_for_operation = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        let size = files_for_operation.length;
        let newArray = files_for_operation.slice(0);
        let countDifference = 0;
        for (let i = 0, len = files.length; i < len; i++) {
            let file_type = extFile(files[i].name);
            let file_date = files[i].lastModifiedDate;
            if (newArray.length > 0) {
                for (let j = 0; j < newArray.length; j++) {
                    if (newArray[j].path !== files[i].path) {
                        countDifference++;
                    }
                }
                if (countDifference === newArray.length) {
                    newArray.push({ name: files[i].name, path: files[i].path, size: files[i].size, date: file_date, key: size, active: true, ext: file_type, verify_status: "default_status" });
                    size++;
                    countDifference = 0;
                }
                else {
                    countDifference = 0;
                }
            }
            else {
                newArray.push({ name: files[i].name, path: files[i].path, size: files[i].size, date: file_date, key: size, active: true, ext: file_type, verify_status: "default_status" });
                size++;
            }
        }
        this.props.operation === "sign" ? sign.set_files = newArray : encrypt.set_files = newArray;
        this.chooseFiles();
    }
    checkFolder(event: any, cb: (items: any, files: IFiles[], folder: boolean) => void) {
        let items = event.dataTransfer.items;
        let counter = 0;
        let files: IFiles[] = [];
        let folder = false;
        let fItems: any = [];
        for (let i = 0; i < items.length; i++) {
            counter++;
            let item = items[i].webkitGetAsEntry();
            fItems.push(item);
            if (item) {
                if (item.isFile) {
                    item.file(function (Dropfile: any) {
                        counter--;
                        files.push(Dropfile);
                        if (!counter) cb(fItems, files, folder);
                    });
                } else if (item.isDirectory) {
                    let dirReader = item.createReader();
                    dirReader.readEntries(function (entries: any) {
                        counter--;
                        for (let j = 0; j < entries.length; j++) {
                            counter++;
                            if (entries[j].isFile) {
                                entries[j].file(function (filesys: any) {
                                    counter--;
                                    files.push(filesys);
                                    if (!counter) cb(fItems, files, folder);
                                });
                            } else {
                                counter--;
                                folder = true;
                                if (!counter) cb(fItems, files, folder);
                            }
                        }
                        if (!counter) cb(fItems, files, folder);
                    });
                }
            }
        }
    };
    dropFolderAndFiles(item: any, cb: (err: Error, files: IFiles[]) => void) {
        let self = this;
        let files: IFiles[] = [];
        let counter = 0;
        counter++;
        if (item) {
            if (item.isFile) {
                item.file(function (Dropfile: any) {
                    counter--;
                    files.push(Dropfile);
                    if (!counter) cb(null, files);
                });
            } else if (item.isDirectory) {
                let dirReader = item.createReader();
                dirReader.readEntries(function (entries: any) {
                    counter--;
                    for (let j = 0; j < entries.length; j++) {
                        counter++;
                        if (entries[j].isFile) {
                            entries[j].file(function (filesys: any) {
                                counter--;
                                files.push(filesys);
                                if (!counter) cb(null, files);
                            });
                        } else {
                            self.dropFolderAndFiles(entries[j], (err, file) => {
                                counter--;
                                for (let s = 0; s < file.length; s++)
                                    files.push(file[s]);
                                if (!counter) cb(null, files);
                            });
                        }
                    }
                    if (!counter) cb(null, files);
                });
            }
        }
    };
    dropHandler(event: any) {
        event.stopPropagation();
        event.preventDefault();
        event.target.classList.remove("draggedOver");
        document.querySelector("#droppableZone").classList.remove("droppableZone-active");
        this.checkFolder(event, (items, files, folder) => {
            if (folder) {
                dlg.ShowDialog(lang.get_resource.Common.add_files, lang.get_resource.Common.add_all_files, (code) => {
                    if (code) {
                        for (let i = 0; i < items.length; i++) {
                            this.dropFolderAndFiles(items[i], (err, files) => {
                                this.dropFiles(files);
                            });
                        }
                    } else {
                        this.dropFiles(files);
                    }
                });
            } else {
                this.dropFiles(files);
            }
        });


    }
    dropZoneActive() {
        document.querySelector("#droppableZone").classList.add("droppableZone-active");
    }
    activeFile(event: any, file: any) {
        let newFiles = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        newFiles[file.key].active = !newFiles[file.key].active;
        this.props.operation === "sign" ? sign.set_files = newFiles : encrypt.set_files = newFiles;
        this.chooseFiles();
    }
    selectedAll() {
        let files_for: any = [];
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        for (let i = 0; i < files.length; i++) {
            files[i].active = true;
        }
        this.props.operation === "sign" ? sign.set_files = files : encrypt.set_files = files;
        this.chooseFiles();
    }
    removeSelectedAll() {
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        for (let i = 0; i < files.length; i++) {
            files[i].active = false;
        }
        this.props.operation === "sign" ? sign.set_files = files : encrypt.set_files = files;
        this.chooseFiles();
    }
    removeAllFiles() {
        this.props.operation === "sign" ? sign.set_files = [] : encrypt.set_files = [];
        this.props.operation === "sign" ? sign.set_sign_info = [] : "";
        this.props.operation === "sign" ? sign.set_sign_info_active = null : "";
        this.chooseFiles();
        this.setState({ key: 0 });
    }
    removeFile(event: any, index: number) {
        event.stopPropagation();
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        let sign_info = this.props.operation === "sign" ? sign.get_sign_info : "";
        let j = 0;
        while (j < sign_info.length) {
            if (sign_info[j].key === index) {
                sign_info.splice(j, 1);
            }
            j++;
        }
        files.splice(index, 1);
        for (let i = index; i < files.length; i++) {
            files[i].key = i;
            for (let j = 0; j < sign_info.length; j++) {
                if (sign_info[j].path === files[i].path) {
                    sign_info[j].key = i;
                }
            }
        }
        this.props.operation === "sign" ? sign.set_files = files : encrypt.set_files = files;
        this.chooseFiles();
    }
    render() {
        const self = this;
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        let active = files.length > 0 ? "active" : "not-active";
        let collection = files.length > 0 ? "collection" : "";
        let disabled = files.length > 0 ? "" : "disabled";
        return (
            <div className={"file-content-height " + active}>
                <div id="file-content" className="content-wrapper z-depth-1">
                    <nav className="app-bar-content">
                        <ul className="app-bar-items">
                            <li className="app-bar-item" style={{ width: "calc(100% - 85px)" }}><span>{lang.get_resource.Settings.add_files}</span></li>
                            <li className="right">
                                <a className={"nav-small-btn waves-effect waves-light " + active} onClick={this.addFiles.bind(this)}>
                                    <i className="material-icons nav-small-icon">add</i>
                                </a>
                                <a className={"nav-small-btn waves-effect waves-light " + disabled} data-activates="dropdown-btn-set-add-files">
                                    <i className="nav-small-icon material-icons">more_vert</i>
                                </a>
                                <ul id="dropdown-btn-set-add-files" className="dropdown-content">
                                    <li><a onClick={this.selectedAll.bind(this)}>{lang.get_resource.Settings.selected_all}</a></li>
                                    <li><a onClick={this.removeSelectedAll.bind(this)}>{lang.get_resource.Settings.remove_selected}</a></li>
                                    <li><a onClick={this.removeAllFiles.bind(this)}>{lang.get_resource.Settings.remove_all_files}</a></li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                    <div className="add">
                        <div id="droppableZone" onDragEnter={function (event: any) { self.dragEnterHandler(event); } }
                            onDrop={function (event: any) { self.dropHandler(event); } }
                            onDragOver={function (event: any) { self.dragOverHandler(event); } }
                            onDragLeave={function (event: any) { self.dragLeaveHandler(event); } }>
                        </div>
                        <div className="add-files" onDragEnter={this.dropZoneActive.bind(this)}>
                            <div className={"add-file-item " + active} id="items-hidden">
                                <input type="file" className="input-file" id="choose-file" value="" multiple onChange={
                                    function (event: any) {
                                        self.viewFiles(event.target.files);
                                    }
                                } />
                                <a className="add-file-but waves-effect waves-light btn-large" id="fileSelect" onClick={this.addFiles.bind(this)}>{lang.get_resource.Settings.choose_files}</a>
                                <div className="add-file-item-text">{lang.get_resource.Settings.drag_drop}</div>
                                <i className="material-icons large fullscreen">fullscreen</i>
                            </div>
                            <div className={"add-files-collection " + collection}>
                                {files.map(function (l: any, i: number) {
                                    return <DropMenuForFile removeFiles={function (event: any) { self.removeFile(event, i); } }
                                        onClickBtn={function (event: any) { self.activeFile(event, files[i]); } }
                                        file_name={l.name}
                                        file_date={l.date}
                                        file_path={l.path}
                                        file_type={l.ext}
                                        verify_status={l.verify_status}
                                        index={l.key}
                                        operation={self.props.operation}
                                        active_file={l.active}
                                        key={i}
                                        />;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
interface IDropMenuForFileProps {
    file_name: string;
    file_date: Date;
    file_path: string;
    file_type: string;
    verify_status: string;
    index: string;
    operation: string;
    active_file: boolean;
    onClickBtn: (event: any) => void;
    removeFiles: (event: any) => void;
}
class DropMenuForFile extends React.Component<IDropMenuForFileProps, any> {
    constructor(props: IDropMenuForFileProps) {
        super(props);
    }
    componentDidMount() {
        $(".file-setting-item").dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 0,
            belowOrigin: false,
            alignment: "left"
        }
        );
    }
    componentDidUpdate() {
        $('.tooltipped').tooltip('remove');
        $('.tooltipped').tooltip({ delay: 50 });
    }
    stopEvent(event: any) {
        event.stopPropagation();
    }
    openFile(event: any, file: string) {
        event.stopPropagation();
        window.electron.shell.openItem(this.props.file_path);
    }
    openFileFolder(event: any, path: string) {
        event.stopPropagation();
        window.electron.shell.showItemInFolder(this.props.file_path);
    }
    render() {
        let self = this;
        let classStatus = "";
        let toolTipText = "";
        let active = "";
        if (this.props.active_file) {
            active = "active";
        }
        if (this.props.operation === "sign") {
            if (this.props.verify_status === "status_ok") {
                classStatus = this.props.verify_status + " tooltipped";
                toolTipText = lang.get_resource.Sign.sign_ok;
            } else if (this.props.verify_status === "status_error") {
                classStatus = this.props.verify_status + " tooltipped";
                toolTipText = lang.get_resource.Sign.sign_error;
            }
        }
        return <div className={"collection-item avatar files-collection " + active} id={"file-" + this.props.index} onClick={this.props.onClickBtn}>
            <div className="r-iconbox-link">
                <div className="r-iconbox-icon"><i className={this.props.file_type} id="file-avatar"></i></div>
                <p className="collection-title">{this.props.file_name}</p>
                <p className="collection-info">{this.props.file_date.toLocaleDateString(lang.get_lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                })}</p>
            </div>
            <i className={classStatus} data-position="left" data-delay="50" data-tooltip={toolTipText} onClick={function () { $('.tooltipped').tooltip('remove'); } }></i>
            <i className="file-setting-item waves-effect material-icons secondary-content"
                data-activates={"dropdown-btn-set-file-" + this.props.index} onClick={self.stopEvent}>more_vert</i>
            <ul id={"dropdown-btn-set-file-" + this.props.index} className="dropdown-content">
                <li><a onClick={function (event: any) { self.openFile(event, self.props.file_path); } }>{lang.get_resource.Settings.open_file}</a></li>
                <li><a onClick={function (event: any) { self.openFileFolder(event, self.props.file_path); } }>{lang.get_resource.Settings.go_to_file}</a></li>
                <li><a onClick={this.props.removeFiles}>{lang.get_resource.Settings.delete_file}</a></li>
            </ul>
        </div>;
    }
}

const MenuStyle = {
    textDecoration: "none",
};
export class MainMenu extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = { open: false };
    }
    handleToggle() {
        this.setState({ open: !this.state.open });
    }
    handleClose() {
        this.setState({ open: false });
    }

   

    render() {
        let settings = {
            draggable: false,
        };
        return (
            <div>
                <nav className="menu-logo">
                    <div className="center">
                        <Link to="/" className="menuheaderlink" href="/" {...settings}>
                            <i className="logo-trusted"><img src="trusted-esign.png" {...settings} /></i><div className="logo-text">{lang.get_resource.About.product_NAME}</div>
                        </Link>
                    </div>
                </nav>
                <Link to="/sign" {...settings} style={MenuStyle}>{lang.get_resource.Sign.Sign}<i className="material-icons left sign">mode_edit</i></Link>
                <Link to="/encrypt" {...settings} style={MenuStyle}>{lang.get_resource.Encrypt.Encrypt}<i className="material-icons left encrypt">enhanced_encryption</i></Link>
                <Link to="/certificate" {...settings} style={MenuStyle}>{lang.get_resource.Certificate.Certificate}<i className="material-icons left cert">library_books</i></Link>
                <div className="menu-elements">
                    <Link className={"bordered--top"} {...settings} to="/about" style={MenuStyle}>{lang.get_resource.About.About}<i className="material-icons left about">about</i></Link>
                    <Link to="/help" {...settings} style={MenuStyle}>{lang.get_resource.Help.Help}<i className="material-icons left help">help</i></Link>
                </div>
            </div>
        );
    }
}
interface ISearchElementProps {
    operation: string;
}
export class SearchElement extends React.Component<ISearchElementProps, any> {

    constructor(props: ISearchElementProps) {
        super(props);
        this.state = { open: false };
        this.searchChange = this.searchChange.bind(this);
    }
    handleOpen() {
        this.setState({ open: true });
    }
    handleClose() {
        this.setState({ open: false });
        if (this.props.operation === "certificate") {
            certs_app.set_search_value = "";
        } else if (this.props.operation === "sign") {
            sign.set_search_value = "";
        } else if (this.props.operation === "encrypt") {
            encrypt.set_search_value = "";
        }
    }
    componentDidMount() {
        $("input#input_text").characterCounter();
        if (this.props.operation === "certificate") {
            certs_app.on(CertificatesApp.SETTINGS, this.searchChange);
        } else if (this.props.operation === "sign") {
            sign.on(SignApp.SETTINGS, this.searchChange);
        } else if (this.props.operation === "encrypt") {
            encrypt.on(EncryptApp.SETTINGS, this.searchChange);
        }
    }
    componentWillUnmount() {
        if (this.props.operation === "certificate") {
            certs_app.removeListener(CertificatesApp.SETTINGS, this.searchChange);
        } else if (this.props.operation === "sign") {
            sign.removeListener(SignApp.SETTINGS, this.searchChange);
        } else if (this.props.operation === "encrypt") {
            encrypt.removeListener(EncryptApp.SETTINGS, this.searchChange);
        }
    }
    searchChange() {
        this.setState({});
    }
    changeSearchValue(e: any) {
        if (this.props.operation === "certificate") {
            certs_app.set_search_value = e.target.value;
            certs_app.set_certificate_for_info = null;
            let certificates = certs_app.get_certificates;
            for (let i = 0; i < certificates.length; i++) {
                certificates[i].active = false;
            }
            certs_app.set_certificates = certificates;
        } else if (this.props.operation === "sign") {
            sign.set_search_value = e.target.value;
            sign.set_certificate_for_info = null;
            let certificates = sign.get_certificates;
            for (let i = 0; i < certificates.length; i++) {
                certificates[i].active = false;
            }
            sign.set_certificates = certificates;
        } else if (this.props.operation === "encrypt") {
            encrypt.set_search_value = e.target.value;
        }
    }
    render() {
        let mainClassName: string;
        let search_value: string = "";
        if (this.state.open === true) {
            mainClassName = "active";
        } else {
            mainClassName = "";
        }
        if (this.props.operation === "certificate") {
            search_value = certs_app.get_search_value
        } else if (this.props.operation === "sign") {
            search_value = sign.get_search_value;
        } else if (this.props.operation === "encrypt") {
            search_value = encrypt.get_search_value;
        }
        return (
            <div className={"search right " + mainClassName}>
                <a className="trigger waves-effect" onClick={this.handleOpen.bind(this)}>
                    <i className="material-icons search-icon">search</i>
                </a>
                <div className={"search-wrapper " + mainClassName}>
                    <input type="text" id="search-input" value={search_value} onChange={this.changeSearchValue.bind(this)} />
                    <a className="closer waves-effect waves-light" onClick={this.handleClose.bind(this)}>
                        <i className="material-icons search-icon">close</i>
                    </a>
                </div>
            </div>
        );
    }
}
interface IMainToolBarProps {
    title: string;
}
export class MainToolBar extends React.Component<IMainToolBarProps, any> {
    constructor(props: IMainToolBarProps) {
        super(props);
    }
    componentDidMount() {
        $(".lang").dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 30,
            belowOrigin: false,
            alignment: "right"
        }
        );
    }
    minimizeWindow() {
        mainWindow.minimize();
    }
    closeWindow() {
        let sign_to_json = ({ settings_for_sign: sign.get_settings, certificate_for_sign: sign.get_sign_certificate });
        let encrypt_to_json = ({ settings_for_encrypt: encrypt.get_settings, certificates_for_encrypt: encrypt.get_certificates_for_encrypt });
        let main_json = ({ lang: lang.get_lang });
        let system = ({ SIGN: sign_to_json, ENCRYPT: encrypt_to_json, MAIN: main_json });
        system = JSON.stringify(system, "", 4);
        native.fs.writeFile(SETTINGS_JSON, system, (err: any) => {
            if (err) {
                console.log(lang.get_resource.Settings.write_file_failed);
            };
            console.log(lang.get_resource.Settings.write_file_ok);
            mainWindow.close();
        });
    }
    maximazeWindow() {
        // if (mainWindow.isMaximized)
        //     mainWindow.unmaximize();
        // else
        //     mainWindow.maximize();
    }
    settingWindow() {
        //mainWindow.showDevTools();
    }
    langChange() {
        lang.get_lang === "RU" ? lang.set_lang = "EN" : lang.set_lang = "RU";
    }
    render() {
        return <nav className="app-bar">
            <div className="col s6 m6 l6 app-bar-wrapper">
                <ul className="app-bar-items">
                    <li>
                        <a data-activates="slide-out" className="menu-btn waves-effect waves-light">
                            <i className="material-icons">menu</i>
                        </a>
                    </li>
                    <li className="app-bar-text">{this.props.title}</li>
                    <li>
                        <ul>
                            <li>
                                <div className="lang" style={{ visibility: "hidden" }}>
                                    <a className={lang.get_lang} onClick={this.langChange.bind(this)} />
                                </div>
                            </li>
                            <li>
                                <a className="minimize-window-btn waves-effect waves-light" onClick={this.minimizeWindow.bind(this)}>
                                    <i className="material-icons">remove</i>
                                </a>
                            </li>
                            <li>
                                <a className="close-window-btn waves-effect waves-light" onClick={this.closeWindow.bind(this)}>
                                    <i className="material-icons">close</i>
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <ul id="slide-out" className="side-nav">
                <MainMenu />
            </ul>
        </nav>;
    }
}
interface ILicenseKeyProps {
    text_info: string;
    closeWindow: () => void;
    icon: string;
}
interface ILicenseKeyState {
    license_file: string;
    license_key: string;
}
export class LicenseKey extends React.Component<ILicenseKeyProps, ILicenseKeyState> {
    constructor(props: ILicenseKeyProps) {
        super(props);
        this.state = ({ license_file: "", license_key: "" });
    }
    componentDidMount() {
        $('input#input_file, textarea#input_key').characterCounter();
    }
    paste() {
        $("#input_key").focus();
        document.execCommand("paste");
        $("#input_key").trigger("autoresize");
    }
    setupLicense() {
        let licFilePath = getLicensePath();
        let path = native.path.dirname(licFilePath);

        let command = "";

        if (window.PLATFORM !== "win32") {
            command = "su -c " + "\"";
            command = command + "mkdir -p " + "'" + path + "'" + " && ";
        } else {
            if (!native.fs.existsSync(path)) {
                command = command + " mkdir " + '"' + path + '"' + " && ";
            }
        }

        let status: any;
        var options = {
            name: 'Trusted eSign'
        };
        if (this.state.license_key) {
            let data = licenseParse(this.state.license_key);
            if (data.sub !== "-") {
                status = getStatus(this.state.license_key);
                if (status.type === "ok") {
                    if (window.PLATFORM === "win32") {
                        command = command + "echo " + this.state.license_key.trim() + " > " + '"' + licFilePath + '"';
                    } else {
                        command = command + " printf " + this.state.license_key.trim() + " > " + "'" + licFilePath + "'" + " && ";
                        command = command + " chmod 777 " + "'" + licFilePath + "'" + "\"";
                    }
                    native.sudo.exec(command, options, function (error: any) {
                        if (!error) {
                            lic.setInfo = data;
                            lic.setStatus = status;
                            $(".toast-lic_key_setup").remove();
                            Materialize.toast(lang.get_resource.License.lic_key_setup, 2000, "toast-lic_key_setup");
                        } else {
                            $(".toast-write_file_error").remove();
                            Materialize.toast(lang.get_resource.Common.write_file_error, 2000, "toast-write_file_error");
                        }
                    });
                } else {
                    $(".toast-status.message").remove();
                    Materialize.toast(status.message, 2000, "toast-status.message");
                }
            } else {
                $(".toast-lic_key_uncorrect").remove();
                Materialize.toast(lang.get_resource.License.lic_key_uncorrect, 2000, "toast-lic_key_uncorrect");
            }
        } else {
            if (native.fs.existsSync(this.state.license_file)) {
                let data = native.fs.readFileSync(this.state.license_file, "utf8");
                if (data) {
                    let info = licenseParse(data);
                    if (info.sub !== "-") {
                        status = getStatus(data);
                        if (status.type === "ok") {
                            if (window.PLATFORM === "win32") {
                                command = command + "echo " + data + " > " + '"' + licFilePath + '"';
                            } else {
                                command = command + " printf " + data + " > " + "'" + licFilePath + "'" + " && ";
                                command = command + " chmod 777 " + "'" + licFilePath + "'" + "\""
                            }
                            window.sudo.exec(command, options, function (error: any) {
                                if (!error) {
                                    lic.setInfo = info;
                                    lic.setStatus = status;
                                    $(".toast-lic_key_setup").remove();
                                    Materialize.toast(lang.get_resource.License.lic_key_setup, 2000, "toast-lic_key_setup");
                                } else {
                                    $(".toast-write_file_error").remove();
                                    Materialize.toast(lang.get_resource.Common.write_file_error, 2000, "toast-write_file_error");
                                }
                            });
                        } else {
                            $(".toast-status.message").remove();
                            Materialize.toast(status.message, 2000, "toast-status.message");
                        }
                    } else {
                        $(".toast-lic_file_uncorrect").remove();
                        Materialize.toast(lang.get_resource.License.lic_file_uncorrect, 2000, "toast-lic_file_uncorrect");
                    }
                } else {
                    $(".toast-read_file_error").remove();
                    Materialize.toast(lang.get_resource.Common.read_file_error, 2000, "toast-read_file_error");
                }
            } else {
                $(".toast-lic_file_not_found").remove();
                Materialize.toast(lang.get_resource.License.lic_file_not_found, 2000, "toast-lic_file_not_found");
            }
        }
        this.props.closeWindow();
    }
    openLicenseFile() {
        if (!window.framework_NW) {
            let file = dialog.showOpenDialog({
                properties: ["openFile"],
                filters: [
                    { name: lang.get_resource.License.license, extensions: ["lic"] }
                ]
            });
            if (file) {
                $("#input_file").focus();
                this.setState({ license_file: file[0], license_key: this.state.license_key });
            }
        }
    }
    render() {
        let self = this;
        let disable = this.state.license_file || this.state.license_key ? "" : "disabled";
        return <div id="add-licence-key" className="modal licence-modal">
            <div className="licence-modal-main">
                <ItemBarWithBtn text={lang.get_resource.License.enter_key} new_class="modal-bar" icon="close" on_btn_click={this.props.closeWindow.bind(this)} />
                <div className="licence-modal-content">
                    <div className="license-key">
                        <div className="input-field col s6 input-field-licence">
                            <i className="material-icons prefix key-prefix">vpn_key</i>
                            <textarea id="input_key" className="materialize-textarea" value={this.state.license_key} onChange={function (e: any) {
                                self.setState({ license_file: self.state.license_file, license_key: e.target.value })
                            } } />
                            <label htmlFor="input_key">{lang.get_resource.License.entered_the_key}</label>
                            <a className="nav-small-btn waves-effect" onClick={this.paste.bind(this)}>
                                <i className="nav-small-icon material-icons">content_copy</i>
                            </a>
                        </div>
                    </div>
                    <div className="or">
                        {lang.get_resource.Common.or}
                    </div>
                    <div className="license-file">
                        <div className="input-field col s6 input-field-licence">
                            <i className="material-icons prefix key-prefix">vpn_key</i>
                            <input id="input_file" type="text" value={this.state.license_file} onChange={function (e: any) {
                                self.setState({ license_file: e.target.value, license_key: self.state.license_key })
                            } } />
                            <label htmlFor="input_file">{lang.get_resource.License.lic_file_choose}</label>
                            <a className="nav-small-btn waves-effect" onClick={this.openLicenseFile.bind(this)}>
                                <i className="nav-small-icon material-icons">insert_drive_file</i>
                            </a>
                        </div>
                    </div>
                    <div className="license-btn">
                        <a className={"waves-effect waves-light btn " + disable} onClick={this.setupLicense.bind(this)}>{lang.get_resource.License.Entered}</a>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export class Password extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = ({
            active: "not-active",
            pass_value: "",
        });
    }

    componentDidMount(): void {
        $("input#input_password").characterCounter();
    }

    verifyValid(): void {
        this.setState({
            active: "not-active"
        });
        application.emit("pass_value", this.state.pass_value);
        $("#get-password").closeModal();
        this.setState({ pass_value: "" });
    }
    closeModal() {
        this.setState({
            active: "not-active"
        });
        application.emit("pass_value", "");
        $("#get-password").closeModal();
        this.setState({ pass_value: "" });
    }

    changePassValue(event: any): void {
        this.setState({
            pass_value: event
        });
    }
    keyDownPassword() {
        let clickEvent = document.createEvent("MouseEvents");
        clickEvent.initEvent("click", true, true);
        document.querySelector("#enter-pass").dispatchEvent(clickEvent);
    }
    render(): any {
        let self = this;
        let active = "";
        if (this.state.pass_value.length > 0) {
            active = "active";
        }
        return <div id="get-password" className="modal password-modal">
            <div className="password-modal-main">
                <ItemBarWithBtn text={lang.get_resource.Settings.pass_enter} new_class="modal-bar" icon="close" on_btn_click={this.closeModal.bind(this)} />
                <div className="password-modal-content">
                    <div className="input-password">
                        <div className="input-field col s6 input-field-password">
                            <i className={"material-icons prefix key-prefix " + active}>vpn_key</i>
                            <input id="input_password" type="password" value={this.state.pass_value}
                                onKeyDown={
                                    function (evt: any) {
                                        if (evt.keyCode === 13) {
                                            self.keyDownPassword();
                                        }
                                    }
                                }
                                onChange={
                                    function (event: any): void {
                                        self.changePassValue(event.target.value);
                                    }
                                }
                                />
                            <label htmlFor="input_password" className={active}>{lang.get_resource.Settings.password}</label>
                        </div>
                        <a className="waves-effect waves-light btn modal-close" id="enter-pass" onClick={this.verifyValid.bind(this)}>{lang.get_resource.License.Entered}</a>
                    </div>
                </div>
            </div>
        </div>;
    }
}
export class Preloader extends React.Component<any, any> {
    render() {
        return <div className="preloader-content">
            <div className="preloader-wrapper big active">
                <div className="spinner-layer spinner-blue-only">
                    <div className="circle-clipper left">
                        <div className="circle"></div>
                    </div>
                    <div className="gap-patch">
                        <div className="circle" />
                    </div>
                    <div className="circle-clipper right">
                        <div className="circle" />
                    </div>
                </div>
            </div>
            <div className="preloader-text">{lang.get_resource.Settings.wait}</div>
        </div>;
    }
};
export class Dialog extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.changeSettings = this.changeSettings.bind(this);
    }
    componentDidMount() {
        dlg.on(DialogBox.SETTINGS, this.changeSettings);
    }
    componentWillUnmount() {
        dlg.removeListener(DialogBox.SETTINGS, this.changeSettings);
    }
    changeSettings() {
        this.setState({});
    }
    clickYes() {
        dlg.CloseDialog(true);
    }
    clickNo() {
        dlg.CloseDialog(false);
    }
    render() {
        let active = "";
        if (dlg.get_dlg_open) {
            active = "active";
        }
        return (
            <div className={"dialog " + active}>
                <div className="dialog-content">
                    <ItemBar text={dlg.get_dlg_title} new_class="dialog-bar" />
                    <div className="dialog-text">
                        <div className="dialog-message">{dlg.get_dlg_message}</div>
                    </div>
                    <div className="dialog-buttons">
                        <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickYes.bind(this)}>{lang.get_resource.Common.yes}</a>
                        <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickNo.bind(this)}>{lang.get_resource.Common.no}</a>
                    </div>
                </div>
            </div>
        );
    }
};
