import React, { Component } from 'react';
import './App.css';
import {Provider} from "react-redux";
import store from "../src/store";
import MapConnected from "./components/main-display/map/map-connected";
import SideBarConnected from "./components/side-bar/side-bar-connected";
import LowerDisplayConnected from "./components/lower-display/lower-display-connected";


class App extends Component {
  render() {
    const views = {
      "map": (<MapConnected viewType={this.props.viewType}/>)
    };

    const mainView = views[this.props.view] || null;

    return (
      <Provider store={store}>
        {mainView}
        <LowerDisplayConnected />
        <SideBarConnected />
      </Provider>
    );
  }
}

export default App;
