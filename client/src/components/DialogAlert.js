import React, {useState} from "react";
import moment from "moment"; 
import {
    Button,
    Modal
  } from "react-bootstrap";
  


function DialogAlert(props) {
    const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  if(props.dialog==="delete"){
  return (

    <>
      <Button variant="danger" onClick={handleShow}>
        Delete
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the lecture of {props.courseName} at {moment(props.startTS).format("DD/MM/YYYY HH:mm")}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={()=>{handleClose();props.onConfirm(props.lectureId);}}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
else if(props.dialog==="turn"){
  return(
    <>
    <Button variant="outline-primary" onClick={handleShow}>
        Turn to online
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Turn Lecture</Modal.Title>
        </Modal.Header>
  <Modal.Body>Are you sure you want to turn the lecture of {props.courseName} at {moment(props.startTS).format("DD/MM/YYYY HH:mm")}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Back
          </Button>
          <Button variant="primary" onClick={()=>{handleClose();props.onConfirm(props.lectureId);}}>
            Turn
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
  }

  
  export default DialogAlert;