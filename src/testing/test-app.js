import React, { Component } from 'react';
import {Provider} from "react-redux";
import store from "../store";
import TestGrid from "./test-grid";

class App extends Component {
  render() {

    return (
      <Provider store={store}>
        <TestGrid />
      </Provider>
    );
  }
}

export default App;
