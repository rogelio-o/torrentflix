import "./CustomNavbar.css";

import React from "react";
import { Link } from "react-router-dom";
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";

import Logo from "./logo.png";

class CustomNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      navbarClass: "",
    };
  }

  componentDidMount() {
    this._scrollHandler = this._handleScroll.bind(this);
    window.addEventListener("scroll", this._scrollHandler);
  }

  componentWillUnmount() {
    if (this._scrollHandler) {
      window.removeEventListener("scroll", this._scrollHandler);
    }
  }

  _handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 100) {
      this.setState({ navbarClass: "main-navbar-toggled" });
    } else {
      this.setState({ navbarClass: "" });
    }
  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    const { navbarClass, isOpen } = this.state;

    return (
      <Navbar
        color="dark"
        fixed="top"
        expand="md"
        dark
        className={"main-navbar " + navbarClass}
      >
        <NavbarBrand href="/">
          <img src={Logo} alt="Torrentflix" />
        </NavbarBrand>
        <NavbarToggler onClick={this.toggle.bind(this)} />
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
    );
  }
}

export default CustomNavbar;
