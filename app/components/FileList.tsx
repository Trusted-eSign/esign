import { is } from "immutable";
import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { List } from "react-virtualized";
import { activeFile, deleteFile} from "../AC";
import { mapToArr } from "../utils";
import FileListItem from "./FileListItem";
import SignatireStatusCicrcle from "./SignatureStatusCircle";

interface IFileRedux {
  active: boolean;
  extension: string;
  filename: string;
  fullpath: string;
  id: number;
  lastModifiedDate: Date;
}

interface IFilelistProps {
  activeFile: (id: number, active?: boolean) => void;
  deleteFile: (fileId: number) => void;
  files: IFileRedux[];
  operation: string;
  selectedFilesPackage: boolean;
  selectingFilesPackage: boolean;
  style: any;
}

class FileList extends React.Component<IFilelistProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    this.noGridOverflow();
  }

  componentWillUpdate() {
    this.noGridOverflow();
  }

  shouldComponentUpdate(nextProps: IFilelistProps) {
    const { files, selectedFilesPackage, selectingFilesPackage } = this.props;

    if (selectingFilesPackage !== nextProps.selectingFilesPackage) {
      return true;
    }

    if (selectingFilesPackage || nextProps.selectingFilesPackage) {
      return false;
    }

    if (!selectingFilesPackage && !nextProps.selectingFilesPackage && nextProps.files.length !== this.props.files.length) {
      return true;
    }

    if (files.length === nextProps.files.length) {
      for (let i = 0; i <= files.length; i++) {
        if (is(files[i], nextProps.files[i])) {
          continue;
        } else {
          return true;
        }
      }
    }

    return false;
  }

  render() {
    const { files } = this.props;

    return (
      <List
        rowCount={files.length}
        height={427}
        width={377}
        overscanRowCount={5}
        rowHeight={64}
        rowRenderer={this.rowRenderer}
        files={files}
        style={{ outline: "none" }}
      />
    );
  }

  rowRenderer = ({ index, key, style }) => {
    const { files, operation } = this.props;

    if (!files.length) {
      return null;
    }

    return (
      <FileListItem
        removeFiles={() => this.removeFile(files[index].id)}
        onClickBtn={() => this.toggleActive(files[index])}
        file={files[index]}
        operation={operation}
        key={key}
        index={index}
        style={style}
      />
    );
  }

  noGridOverflow() {
    const grid = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0];

    if (grid) {
      grid.style.overflow = "";
    }
  }

  removeFile = (id: number) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile } = this.props;

    deleteFile(id);
  }

  toggleActive(file: any) {
    // tslint:disable-next-line:no-shadowed-variable
    const { activeFile } = this.props;

    activeFile(file.id, !file.active);
  }
}

export default connect((state) => {
  return {
    files: mapToArr(state.files.entities),
    selectedFilesPackage: state.files.selectedFilesPackage,
    selectingFilesPackage: state.files.selectingFilesPackage,
  };
}, { activeFile, deleteFile })(FileList);
