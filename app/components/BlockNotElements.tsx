import * as React from "react";

interface IBlockNotElementsProps {
  name: string;
  title: string;
}

class BlockNotElements extends React.Component<IBlockNotElementsProps, any> {
  constructor(props: IBlockNotElementsProps) {
    super(props);
  }

  render() {
    const { name, title } = this.props;
    return <div className={"cert-item " + name}>
      <div className="add-file-item-text">{title}</div>
      <i className="material-icons large fullscreen">block</i>
    </div>;
  }
}

export default BlockNotElements;
