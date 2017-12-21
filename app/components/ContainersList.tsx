import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { activeContainer, loadAllContainers } from "../AC";
import accordion from "../decorators/accordion";
import { filteredContainersSelector } from "../selectors";
import { mapToArr } from "../utils";
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
  }

  render() {
    const { activeContainer, containers, active, isLoading, toggleOpenItem, isItemOpened } = this.props;
    const { localize, locale } = this.context;

    if (isLoading) {
      return <ProgressBars />;
    }

    const elements = containers.map((container: any) =>
      <li key={container.id}>
        <ContainerListItem
          container={container}
          isOpen={active === container.id}
          activeContainer = {() => activeContainer(container.id)}
        />
      </li>);

    return (
      <ul>
        {elements}
      </ul>
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
