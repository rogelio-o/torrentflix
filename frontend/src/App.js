import "./App.css";

import React, { Component } from "react";
import { BrowserRouter, Redirect, Switch } from "react-router-dom";

import { LayoutRoute, MainLayout } from "./components/Layout";
import ListMoviesPage from "./pages/movies/ListMoviesPage";
import ListSeriesPage from "./pages/series/ListSeriesPage";

const getBasename = () => {
  return `/${process.env.PUBLIC_URL.split("/").pop()}`;
};

class App extends Component {
  render() {
    return (
      <BrowserRouter basename={getBasename()}>
        <Switch>
          <LayoutRoute
            exact
            path="/series"
            layout={MainLayout}
            component={ListSeriesPage}
          />
          <LayoutRoute
            exact
            path="/movies"
            layout={MainLayout}
            component={ListMoviesPage}
          />
          <Redirect to="/series" />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
