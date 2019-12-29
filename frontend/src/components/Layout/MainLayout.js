import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";

import Alert from "./Alert";

const MainLayout = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const { children } = props;

  return (
    <div>
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">Torrentflix</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/series">
                Series
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/movies">
                Movies
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/torrents">
                Torrents
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/renderizations">
                Renderizations
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      {children}
      <Alert />
    </div>
  );
};

export default MainLayout;
