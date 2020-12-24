import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API/API";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
class Upload extends Component {
  state = {
    selectedFile: null,
    success: false,
    failure: false,
    failureReason: "",
    start: "",
    end: "",
  };
  onFileChangeHandler = (event) => {
    //whenever a file is selected this happens and put the selected file in the state
    this.setState({
      selectedFile: event.target.files[0],
      success: false,
      failure: false,
      start: "",
      end: "",
      noFile: false,
      noDate: false,
    });
  };

  closeAlert = (type) => {
    if (type === "file") {
      this.setState({ noFile: false });
    } else if (type === "date") {
      this.setState({ noDate: false });
    }
  };
  dateChange = (event) => {
    if (event.target.id === "start") {
      this.setState({ start: event.target.value });
    } else if (event.target.id === "end") {
      this.setState({ end: event.target.value });
    }
  };
  fileUploadHandler = (event) => {
    //whenever the Upload button is clicked this happens and call the api to upload
    if (this.state.selectedFile !== null) {
      if (
        this.props.section === "Schedules" &&
        (this.state.start === "" || this.state.end === "")
      ) {
        this.setState({ noDate: true });
      } else {
        API.uploadCsv(
          this.state.selectedFile,
          this.props.section,
          this.state.start,
          this.state.end
        )
          .then((res) => {
            if (res.success === true) {
              this.setState({ success: true, failure: false });
            } else if (res.success === false) {
              let reason;
              switch (res.reason) {
                case "UNIQUE constraint failed: users.ID":
                  reason = ": you can't upload the same file twice";
                  break;
                case "Malformed input.":
                  reason = ": the file's format is not correct";
                  break;
                default:
                  reason = "";
                  break;
              }
              this.setState({
                success: false,
                failure: true,
                failureReason: reason,
              });
            }
          })
          .catch((errorObj) => {
            this.setState({ success: false, failure: true });
          });
      }
    } else {
      this.setState({ noFile: true });
    }
  };

  render() {
    return (
      <Form className="m-4 p-1">
        <h3>Please Select Your {this.props.section} File</h3>
        {this.state.success ? (
          <h4 id="uploadSucc" className="my-4 text-success">
            Your File Has been Uploaded Successfuly!
          </h4>
        ) : (
          ""
        )}
        {this.state.failure ? (
          <h4 id="uploadFail" className="my-4 text-danger">
            There was a problem {this.state.failureReason}, please try again!
          </h4>
        ) : (
          ""
        )}

        <Form.Group>
          <Form.File
            onChange={this.onFileChangeHandler}
            id="file"
            name="file"
            required
          />
          {this.props.section === "Schedules" ? (
            <>
              <label className="mt-4" for="startDay">
                Please Select Start Day
                <input
                  required
                  className="ml-1"
                  type="date"
                  id="start"
                  onChange={this.dateChange}
                ></input>
              </label>
              <label for="startDay" className="ml-5">
                Please Select End Day
                <input
                  required
                  className="ml-1"
                  type="date"
                  id="end"
                  onChange={this.dateChange}
                ></input>
              </label>
            </>
          ) : (
            ""
          )}
        </Form.Group>
        <Button
          id="uploadBTN"
          variant="outline-success"
          onClick={this.fileUploadHandler}
        >
          Upload
        </Button>
        {this.state.noFile ? (
          <Row xs={2} md={4} lg={4}>
            <Col>
              <Alert
                className="mt-3"
                variant="danger"
                onClose={() => this.closeAlert("file")}
                dismissible
              >
                <h4 id="selectError">Please Select A File!</h4>
              </Alert>
            </Col>
          </Row>
        ) : (
          ""
        )}
        {this.state.noDate ? (
          <Row xs={2} md={4} lg={4}>
            <Col>
              <Alert
                className="mt-3"
                variant="danger"
                onClose={() => this.closeAlert("date")}
                dismissible
              >
                <h4>Please Select A Date!</h4>
              </Alert>
            </Col>
          </Row>
        ) : (
          ""
        )}
      </Form>
    );
  }
}

export default Upload;
