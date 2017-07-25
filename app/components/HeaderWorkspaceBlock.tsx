import * as React from "react";

interface IHeaderWorkspaceBlockProps {
  text: string;
  second_text: string;
  new_class: string;
}

class HeaderWorkspaceBlock extends React.Component<ItemBarProps, any> {
  render() {
    const { text, second_text, new_class } = this.props;
    const name = new_class ? new_class : "";

    let element: any;
    if (second_text) {
      element = <div className="cert-title-main">
        <div className="collection-title cert-title">{text}</div>
        <div className="collection-info cert-info cert-title">{second_text}</div>
      </div>;
    } else {
      element = <span>{text}</span>;
    }
    return (
      <nav className={"app-bar-content " + name}>
        <ul className="app-bar-items">
          <li className="app-bar-item" style={{ width: 100 + "%" }}>
            {element}
          </li>
        </ul>
      </nav>
    );
  }
}

export default HeaderWorkspaceBlock;
