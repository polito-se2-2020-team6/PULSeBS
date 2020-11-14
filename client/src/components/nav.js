import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
// import { Link, NavLink } from "react-router-dom";

import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../data/consts";

class Navigation extends Component {
  state = {};
  render() {
    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            {context.authUser ? (
              <>
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                  <Navbar.Brand>PULSEBS</Navbar.Brand>
                  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                  <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="container-fluid">
                      {context.authUser.type === ROLES.STUDENT && (
                        <Nav.Item>
                          <Nav.Link href="/student">Student</Nav.Link>
                        </Nav.Item>
                      )}
                      {context.authUser.type === ROLES.TEACHER && (
                        <Nav.Item>
                          <Nav.Link href="/teacher">Teacher</Nav.Link>
                        </Nav.Item>
                      )}
                      <Nav.Item className="ml-auto">
                        <Nav.Link
                          className="nav-link"
                          to="/logout"
                          onClick={() => context.logoutUser()}
                        >
                          Logout
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Navbar.Collapse>
                </Navbar>
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default Navigation;
