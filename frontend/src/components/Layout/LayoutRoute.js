import React from "react";
import { Route } from "react-router-dom";

const LayoutRoute = ({ component: Component, layout: Layout, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      <Layout>
        <div className="container">
          <Component {...props} />
        </div>
      </Layout>
    )}
  />
);

export default LayoutRoute;
