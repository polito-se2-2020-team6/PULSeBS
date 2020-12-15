import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button"
class Upload extends Component {
  state = {};
  render() {
    return (
      <>
        <Form className="m-4 p-1">
            <h3>Please Select Your {this.props.section} File</h3>
          <Form.Group >
            <Form.File
              id="exampleFormControlFile1"
              label=""
            />
          </Form.Group>
          <Button variant="outline-success" type="submit">
            Upload
          </Button>
        </Form>
      </>
    );
  }
}

export default Upload;
