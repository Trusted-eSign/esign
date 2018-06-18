import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { activeContainer, loadAllContainers } from "../AC";
import { filteredContainersSelector } from "../selectors";
import ContainerListItem from "./ContainerListItem";
import ProgressBars from "./ProgressBars";

class ContainersList extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    const { isLoaded, isLoading, loadAllContainers } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllContainers();
    }

    $(".collapsible").collapsible();
  }

  getCollapsibleElement(head: string, elements: object[], active: boolean = false) {
    if (!elements || elements.length === 0) {
      return null;
    }

    const activeSection = active ? "active" : "";

    return (
      <li>
        <div className={`collapsible-header color ${activeSection}`}>
          {head}
        </div>
        <div className="collapsible-body">{elements}</div>
      </li>
    );
  }

  render() {
    const { activeContainer, containers, active, isLoading } = this.props;
    const objContainers: { [key: string]: object[] } = {};

    if (isLoading) {
      return <ProgressBars />;
    }

    const readers = containers.map((container: any) =>
      container.reader,
    );

    const uniqueReaders = readers.filter((item, pos) => {
      return readers.indexOf(item) === pos;
    });

    for (const key of uniqueReaders) {
      objContainers[key] = [];
    }

    containers.forEach((container: any) =>
      objContainers[container.reader].push(
        <ContainerListItem
          key={container.id}
          container={container}
          isOpen={active === container.id}
          activeContainer={() => activeContainer(container.id)}
        />),
    );

    const elements = uniqueReaders.map((reader: any, id: number) => {
      return this.getCollapsibleElement(reader, objContainers[reader], id === 0);
    },
    );

    return (
      <div>
        <ul className="collapsible" data-collapsible="accordion">
          {elements}
        </ul>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    active: state.containers.active,
    containers: filteredContainersSelector(state),
    isLoaded: state.containers.loaded,
    isLoading: state.containers.loading,
  };
}, { activeContainer, filteredContainersSelector, loadAllContainers })(ContainersList);
