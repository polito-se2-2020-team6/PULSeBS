import { FormGroup, Typography } from "@material-ui/core";
import React from "react";
import { Modal, ModalBody, ModalHeader, Label } from "reactstrap";

class PositiveStudentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({ modal: !this.state.modal });
  }

  render() {
    const student = this.props.positiveSTD;
    return (
      <div>
        <Modal toggle={this.props.toggleModal} isOpen={this.props.isModalOpen}>
          <ModalHeader toggle={this.props.toggleModal}>
            Detail of Positive Student to Report
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label htmlFor="date">Firstname :</Label>
              <p id="date">{student.firstname}</p>
            </FormGroup>
            <FormGroup>
              <Typography>{student.lastname}</Typography>
              <Typography>{student.firstname}</Typography>
            </FormGroup>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default PositiveStudentModal;
