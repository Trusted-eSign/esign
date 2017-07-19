import * as React from "react";

export default (CustomComponent: any) => class AccordionDecorator extends React.Component<any, any> {
    constructor(props: any) {
      super(props);
      this.state = {
        openItemId: null,
      };
    }

    toggleOpenItem = (openItemId: any) => (ev: any) => {
        if (ev && ev.preventDefault) {
          ev.preventDefault();
        }

        this.setState({
            openItemId: this.isItemOpened(openItemId) ? null : openItemId,
        });
    }

    isItemOpened = (id: number) => id === this.state.openItemId;

    render() {
        return <CustomComponent {...this.props} toggleOpenItem={this.toggleOpenItem} isItemOpened={this.isItemOpened}/>;
    }
};
