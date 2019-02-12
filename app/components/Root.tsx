import React from "react";
import {hot} from "react-hot-loader/root";
import { Provider } from "react-redux";
import App from "./App";

class Root extends React.Component<any, any> {
  render() {
    return (
      <Provider store={this.props.store}>
        <App />
      </Provider>
    );
  }
}

export default hot(Root);
