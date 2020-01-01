import React from "react";

import Alert from "./Alert";
import CustomNavbar from "./CustomNavbar";

const MainLayout = (props) => {
  const { children } = props;

  return (
    <div>
      <CustomNavbar />
      {children}
      <Alert />
    </div>
  );
};

export default MainLayout;
