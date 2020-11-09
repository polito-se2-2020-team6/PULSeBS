import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

class Navigation extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <Link to="/">
                <li className="navbar-brand">
                  PULSE <span className="sr-only">(current)</span>
                </li>
              </Link>
              <Link to="/Student">
                <li className="nav-item nav-link">Student</li>
              </Link>
              <Link to="/Teacher">
                <li className="nav-item nav-link">Teacher</li>
              </Link>
            </ul>
          </div>
        </nav>
      </Fragment>
    );
  }
}

export default Navigation;
