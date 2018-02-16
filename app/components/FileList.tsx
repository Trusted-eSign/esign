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
  style: any;
}

class FileList extends React.Component<IFilelistProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.overflow = "";
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
      />
    );
  }

  rowRenderer = ({ index, key, style }) => {
    const { files, operation } = this.props;

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
  };
}, { activeFile, deleteFile })(FileList);
