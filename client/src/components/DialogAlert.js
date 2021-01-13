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
      <Button variant="danger" onClick={handleShow} id="but1">
        Delete
      </Button>

      <Modal show={show} onHide={handleClose} id="modId">
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the lecture of {props.courseName} at {moment(props.startTS).format("DD/MM/YYYY HH:mm")}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} id="but2">
            No
          </Button>
          <Button id="but3" variant="danger" onClick={()=>{handleClose();props.onConfirm(props.lectureId);}}>
            Yes, I am
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
else if(props.dialog==="turn"){
  return(
    <>
    <Button variant="outline-primary" onClick={handleShow} id="but4">
        Turn to online
      </Button>

      <Modal show={show} onHide={handleClose} id="modId1"> 
        <Modal.Header closeButton>
          <Modal.Title>Turn Lecture</Modal.Title>
        </Modal.Header>
  <Modal.Body>Are you sure you want to turn the lecture of {props.courseName} at {moment(props.startTS).format("DD/MM/YYYY HH:mm")}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} id="but5">
            No
          </Button>
          <Button variant="primary" id="but6" onClick={()=>{handleClose();props.onConfirm(props.lectureId);}}>
            Yes, I am
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
else if(props.dialog==="UpdateList"){
  return(
    <>
    <Button variant="success"  size="lg" onClick={handleShow} id="but4" style={{height:"70px"}}>
        Update
      </Button>

      <Modal show={show} onHide={handleClose} id="modId2"> 
        <Modal.Header closeButton>
          <Modal.Title>Update Lectures</Modal.Title>
        </Modal.Header>
  <Modal.Body>Are you sure you want to Update the lectures?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} id="but5">
            No
          </Button>
          <Button variant="primary" id="but6" onClick={()=>{handleClose();props.onConfirm();}}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}


}

  
  export default DialogAlert;