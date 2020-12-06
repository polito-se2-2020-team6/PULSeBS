import React, {useState} from "react";
import {
    Button,
    Modal
  } from "react-bootstrap";
  import { AuthContext } from "../auth/AuthContext";


function DialogAlert(props) {
    const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="danger" onClick={handleShow}>
        Delete
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete {props.lectureId}?</Modal.Body>
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
  DialogAlert.contextType = AuthContext;
  
  export default DialogAlert;