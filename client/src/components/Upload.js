import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API/API";

class Upload extends Component {
  state = {
    selectedFile: null,
    success:false,
    failure:false,
    failureReason:'',
  };
  onFileChangeHandler = (event) => {
    //whenever a file is selected this happens and put the selected file in the state
    this.setState({
      selectedFile: event.target.files[0],
      success:false,
      failure:false,
    });
  };
  fileUploadHandler() {
    //whenever the Upload button is clicked this happens and call the api to upload 
    API.uploadCsv(this.state.selectedFile, this.props.section)
      .then((res) => {
        if(res.success === true){
          this.setState({ success: true, failure:false });
        }else if(res.success === false){
          this.setState({ success: false, failure:true ,failureReason:res.reason});

        }
        
      })
      .catch((errorObj) => {
        this.setState({ success: false, failure:true });
      });
  }

  render() {
    return (
     
        <Form className="m-4 p-1">
          <h3>Please Select Your {this.props.section} File</h3>
          {this.state.success ? (
            <h4 className="my-4 text-success">Your File Has been Uploaded Successfuly!</h4>
          ) : (
            ''
          )}
          {this.state.failure ? (
            <h4 className="my-4 text-danger">There was a problem "{this.state.failureReason}", please try again!</h4>
          ):(
            ''
          )}

          <Form.Group>
            <Form.File
              onChange={this.onFileChangeHandler}
              id="file"
              name="file"
            />
          </Form.Group>
          <Button
            variant="outline-success"
            onClick={() => this.fileUploadHandler()}
          >
            Upload
          </Button>
        </Form>
     
    );
  }
}

export default Upload;
