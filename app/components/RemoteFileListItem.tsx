import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";

interface IFileRemote {
  extra: any;
  id: number;
  loaded: boolean;
  loading: boolean;
  name: string;
  socketId: string;
  totalSize: number;
  url: string;
}

interface IRemoteFileListItemProps {
  file: IFileRedux;
  operation: string;
  onClickBtn: (event: any) => void;
  removeFiles: (event: any) => void;
  index: string;
}

class RemoteFileListItem extends React.Component<IRemoteFileListItemProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    $(".file-setting-item").dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      gutter: 0,
      belowOrigin: false,
      alignment: "left",
    },
    );
  }

  shouldComponentUpdate(nextProps: IRemoteFileListItemProps) {
    return nextProps.file.active !== this.props.file.active || nextProps.file.id !== this.props.file.id;
  }

  stopEvent(event: any) {
    event.stopPropagation();
  }

  render() {
    const { localize, locale } = this.context;
    const { file, operation, style } = this.props;

    if ( !file.loading ) {
      return null;
    }

    return (
      <div style={style}>
        <div className={"collection-item avatar files-collection active"} id={"file-" + this.props.index} onClick={this.props.onClickBtn}>
          <div className="r-iconbox-link">
            <p className="collection-title">{file.name}</p>
            <p className="collection-info">{file.totalSize + " байт"}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default RemoteFileListItem;
