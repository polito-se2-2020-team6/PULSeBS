import React, { Component, Fragment } from "react";
import { Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";

class Navigation extends Component {
  state = {};
  render() {
    return (
      <Fragment>
        <Navbar bg="primary" variant="dark">
    <Navbar.Brand href="#home">PULSeBS</Navbar.Brand>
    {/*  <Nav className="mr-auto">
      <Nav.Link href="#home">Home</Nav.Link>
      <Nav.Link href="#features">Features</Nav.Link>
      <Nav.Link href="#pricing">Pricing</Nav.Link>
    </Nav>
    <Form inline>
      <FormControl type="text" placeholder="Search" className="mr-sm-2" />
      <Button variant="outline-light">Search</Button>
    </Form>  */}
        </Navbar>
      </Fragment>
    );
  }
}

export default Navigation;