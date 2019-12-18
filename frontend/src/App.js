import "./App.css";

import React, { Component } from "react";
import { BrowserRouter, Redirect, Switch } from "react-router-dom";

import { LayoutRoute, MainLayout } from "./components/Layout";
import ListMoviesPage from "./pages/movies/ListMoviesPage";
import ViewMoviePage from "./pages/movies/ViewMoviePage";
import ListRenderizationsPage from "./pages/renderizations/ListRenderizationsPage";
import ListSeriesPage from "./pages/series/ListSeriesPage";
import ViewSeriePage from "./pages/series/ViewSeriePage";
import ListTorrentPage from "./pages/torrents/ListTorrentPage";

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
            path="/series/:id"
            layout={MainLayout}
            component={ViewSeriePage}
          />
          <LayoutRoute
            exact
            path="/movies"
            layout={MainLayout}
            component={ListMoviesPage}
          />
          <LayoutRoute
            exact
            path="/movies/:id"
            layout={MainLayout}
            component={ViewMoviePage}
          />
          <LayoutRoute
            exact
            path="/torrents"
            layout={MainLayout}
            component={ListTorrentPage}
          />
          <LayoutRoute
            exact
            path="/renderizations"
            layout={MainLayout}
            component={ListRenderizationsPage}
          />
          <Redirect to="/series" />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
