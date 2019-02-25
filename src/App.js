import React, { Component } from 'react';
import './App.css';
import {Provider} from "react-redux";
import store from "../src/store";
import EnvironmentConnected from "./components/environment/environment-connected";
import MapConnected from "./components/map/map-connected";
import SideBarConnected from "./components/side-bar/side-bar-connected";

class App extends Component {
  render() {
    const views = {
      "environment": (<EnvironmentConnected />),
      "map": (<MapConnected viewType={this.props.viewType}/>)
    };

    const mainView = views[this.props.view] || null;

    return (
      <Provider store={store}>
        {mainView}
        <SideBarConnected />
      </Provider>
    );
  }
}

export default App;
