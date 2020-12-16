import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../API/API"


class Upload extends Component {
  state = {
    selectedFile: null,
    loaded: 0, //i dont know if i need it
  };
  onFileChangeHandler = event =>{
    //console.log(event.target.files[0])
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })

  }
  fileUploadHandler(){
    console.log("Upload")
    API.uploadCsv(this.state.selectedFile,this.props.section)
      .then((res) => {
        console.log("is all right?")
        
      })
      .catch((errorObj) => {
        console.log("wrong")
        console.log(errorObj);
      });
    /*const data = new FormData() 
    data.append('file', this.state.selectedFile[0])
    axios.post("http://localhost:3000/API/REST.php/api/students/upload", data, {
    })
      .then(res => { // then print response status
        toast.success('upload success')
        console.log("badoòa")
      })
      .catch(err => { // then print response status
        toast.error('upload fail')
        console.log("tutto sbagliato")
      })
      */
  }

  render() {
    return (
      <>
        <Form className="m-4 p-1">
            <h3>Please Select Your {this.props.section} File</h3>
          <Form.Group >
            <Form.File
            onChange={this.onFileChangeHandler}
              id="file" 
              name="files"
            />
          </Form.Group>
          <Button variant="outline-success" 
          onClick={()=>this.fileUploadHandler()}>
            Upload
          </Button>
        </Form>
      </>
    );
  }
}

export default Upload;
