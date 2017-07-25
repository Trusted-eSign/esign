import * as React from "react";
import { Link } from "react-router";

interface IMainWindowOperationsProps {
  info: string;
  title_pre: string;
  title_post: string;
  operation: string;
}

class MainWindowOperation extends React.Component<IMainWindowOperationsProps, any> {
  constructor(props: IMainWindowOperationsProps) {
    super(props);
  }

  render() {
    const {info, title_pre, title_post, operation } = this.props;

    return (
      <div className="col l3 s4">
        <Link to={"/" + operation} className="r-iconbox-link iconpos_left">
          <div className="r-iconbox-link">
            <div className="r-iconbox-icon">
              <div className={operation + "_roundbutton_icon"}></div>
            </div>
            <h5 className="r-iconbox-title">{title_pre}<br />{title_post}</h5>
          </div>
          <div className="r-iconbox-text">
            <p>{info}</p>
          </div>
        </Link>
      </div>
    );
  }
}

export default MainWindowOperation;
