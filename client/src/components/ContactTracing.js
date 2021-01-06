import React from "react";
import { Container, Jumbotron } from "react-bootstrap";
class ContactTracing extends React.Component {
  render() {
    return (
      <>
        <Jumbotron fluid>
          <Container>
            <h1>Contact Tracing Report</h1>
            <p>
              A page for reporting the positive students to comply with safety
              regulations.
            </p>
          </Container>
        </Jumbotron>
      </>
    );
  }
}

export default ContactTracing;
