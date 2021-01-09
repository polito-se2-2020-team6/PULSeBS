import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../data/consts";

class Navigation extends Component {
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
                        <NavItem>
                          <NavLink
                            className="nav-link"
                            to={
                              "/student/home?userid=" + context.authUser.userId
                            }
                          >
                            Student
                          </NavLink>
                        </NavItem>
                      )}
                      {context.authUser.type === ROLES.STUDENT && (
                        <NavItem>
                          <NavLink
                            className="nav-link"
                            id="calendar"
                            to={
                              // send userID to this route for getting its date for The calendar
                              "/student/calendar?userid=" +
                              context.authUser.userId
                            }
                          >
                            Calendar
                          </NavLink>
                        </NavItem>
                      )}
                      {context.authUser.type === ROLES.TEACHER && (
                        <NavItem>
                          <NavLink className="nav-link" to="/teacher/home">
                            Courses
                          </NavLink>
                        </NavItem>
                      )}
                      {context.authUser.type === ROLES.TEACHER && (
                        <NavItem>
                          <NavLink
                            id="historicaldata"
                            className="nav-link"
                            to="/teacher/historicaldata"
                          >
                            Historical Data
                          </NavLink>
                        </NavItem>
                      )}
                      {context.authUser.type === ROLES.BOOKING_MANAGER && (
                        <NavItem>
                          <NavLink
                            className="nav-link"
                            to="/booking-manager/home"
                          >
                            Booking Manager
                          </NavLink>
                        </NavItem>
                      )}
                      {context.authUser.type === ROLES.BOOKING_MANAGER && (
                        <NavItem>
                          <NavLink
                            className="nav-link"
                            to="/booking-manager/contact-tracing"
                          >
                            Contact Tracing
                          </NavLink>
                        </NavItem>
                      )}

                      <NavItem className="ml-auto">
                        <NavLink
                          id="logout"
                          className="nav-link"
                          to="/logout"
                          onClick={() => context.logoutUser()}
                        >
                          Logout
                        </NavLink>
                      </NavItem>
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
